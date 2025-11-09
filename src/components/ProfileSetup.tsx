import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Calendar, Phone, MapPin } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  phone_number: z.string().regex(/^\+?[\d\s-()]+$/, "Invalid phone number"),
  address_line1: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().length(2, "State must be 2 characters (e.g., CA)"),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
});

export const ProfileSetup = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    phone_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form
      profileSchema.parse(formData);
      
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          date_of_birth: formData.date_of_birth,
          phone_number: formData.phone_number,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2 || null,
          city: formData.city,
          state: formData.state.toUpperCase(),
          zip_code: formData.zip_code,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update verification status
      const { error: verificationError } = await supabase
        .from("verification_status")
        .update({
          profile_completed: true,
          verification_level: "basic",
        })
        .eq("user_id", user.id);

      if (verificationError) throw verificationError;

      toast({
        title: "Profile completed!",
        description: "Now you can add your first card.",
      });

      // Reload to show the next step
      window.location.reload();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-muted flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-elevated">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Complete Your Profile
            </h2>
            <p className="text-sm text-muted-foreground">
              We need a few details to get you started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="pl-10"
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line1">Street Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address_line1"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  placeholder="123 Main St"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line2">Apt, Suite (Optional)</Label>
              <Input
                id="address_line2"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleChange}
                placeholder="Apt 4B"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="NY"
                  maxLength={2}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                placeholder="10001"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-foreground text-background hover:bg-foreground/90"
              disabled={loading}
            >
              {loading ? "Saving..." : "Continue"}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              🔒 Your information is encrypted and secure
            </p>
          </form>
        </div>
      </Card>
    </div>
  );
};
