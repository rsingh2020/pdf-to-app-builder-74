import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard } from "lucide-react";
import { z } from "zod";

const cardSchema = z.object({
  card_name: z.string().min(2, "Card name must be at least 2 characters"),
  card_type: z.string().min(1, "Please select card type"),
  last_four: z.string().regex(/^\d{4}$/, "Last 4 digits must be exactly 4 digits"),
  balance: z.number().min(0, "Balance must be positive"),
  credit_limit: z.number().min(0, "Credit limit must be positive"),
  annual_fee: z.number().min(0, "Annual fee must be positive"),
  cashback: z.number().min(0, "Cashback must be positive"),
  pending_dues: z.number().min(0, "Pending dues must be positive"),
  card_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  apr: z.number().min(0, "APR must be positive").max(100, "APR cannot exceed 100%"),
  due_date: z.string().optional(),
  rewards_type: z.string().min(1, "Please select rewards type"),
});

interface AddCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCardAdded?: () => void;
}

export const AddCardModal = ({ open, onOpenChange, onCardAdded }: AddCardModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    card_name: "",
    card_type: "",
    last_four: "",
    balance: "",
    credit_limit: "",
    annual_fee: "",
    cashback: "",
    pending_dues: "",
    card_image_url: "",
    apr: "",
    due_date: "",
    rewards_type: "cashback",
  });
  const { toast } = useToast();

  const fillTestCard = () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);
    
    setFormData({
      card_name: "Test Card",
      card_type: "Visa",
      last_four: "0366",
      balance: "1000.00",
      credit_limit: "10000.00",
      annual_fee: "95.00",
      cashback: "150.00",
      pending_dues: "250.00",
      card_image_url: "",
      apr: "18.99",
      due_date: futureDate.toISOString().split('T')[0],
      rewards_type: "cashback",
    });
    toast({
      title: "Test card loaded",
      description: "You can modify the details or add as is",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "last_four") {
      // Only allow digits, max 4
      const digits = value.replace(/\D/g, "").slice(0, 4);
      setFormData({ ...formData, [name]: digits });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form
      const validatedData = cardSchema.parse({
        card_name: formData.card_name,
        card_type: formData.card_type,
        last_four: formData.last_four,
        balance: parseFloat(formData.balance) || 0,
        credit_limit: parseFloat(formData.credit_limit) || 10000,
        annual_fee: parseFloat(formData.annual_fee) || 0,
        cashback: parseFloat(formData.cashback) || 0,
        pending_dues: parseFloat(formData.pending_dues) || 0,
        card_image_url: formData.card_image_url || "",
        apr: parseFloat(formData.apr) || 0,
        due_date: formData.due_date || undefined,
        rewards_type: formData.rewards_type,
      });

      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert card
      const { error } = await supabase.from("cards").insert({
        user_id: user.id,
        card_name: validatedData.card_name,
        card_type: validatedData.card_type,
        last_four: validatedData.last_four,
        balance: validatedData.balance,
        credit_limit: validatedData.credit_limit,
        annual_fee: validatedData.annual_fee,
        cashback: validatedData.cashback,
        pending_dues: validatedData.pending_dues,
        card_image_url: validatedData.card_image_url || null,
        apr: validatedData.apr,
        due_date: validatedData.due_date || null,
        rewards_type: validatedData.rewards_type,
        is_primary: false,
      });

      if (error) throw error;

      toast({
        title: "Card added successfully!",
        description: `${validatedData.card_name} is now linked to your account.`,
      });

      // Reset form
      setFormData({
        card_name: "",
        card_type: "",
        last_four: "",
        balance: "",
        credit_limit: "",
        annual_fee: "",
        cashback: "",
        pending_dues: "",
        card_image_url: "",
        apr: "",
        due_date: "",
        rewards_type: "cashback",
      });

      onOpenChange(false);
      onCardAdded?.();
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
          description: error.message || "Failed to add card",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-accent" />
            Add New Card
          </DialogTitle>
          <DialogDescription>
            Link a credit or debit card to your account
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fillTestCard}
            className="w-full"
          >
            Use Test Card (Development)
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card_name">Card Nickname</Label>
            <Input
              id="card_name"
              name="card_name"
              value={formData.card_name}
              onChange={handleChange}
              placeholder="Personal Visa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card_type">Card Type</Label>
            <Select
              value={formData.card_type}
              onValueChange={(value) =>
                setFormData({ ...formData, card_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select card type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Visa">Visa</SelectItem>
                <SelectItem value="Mastercard">Mastercard</SelectItem>
                <SelectItem value="American Express">American Express</SelectItem>
                <SelectItem value="Discover">Discover</SelectItem>
                <SelectItem value="Apple Cash">Apple Cash</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_four">Last 4 Digits of Card</Label>
            <Input
              id="last_four"
              name="last_four"
              value={formData.last_four}
              onChange={handleChange}
              placeholder="1234"
              maxLength={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              🔒 For security, we only store the last 4 digits
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Current Balance (Optional)</Label>
            <Input
              id="balance"
              name="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit_limit">Credit Limit</Label>
            <Input
              id="credit_limit"
              name="credit_limit"
              type="number"
              step="0.01"
              value={formData.credit_limit}
              onChange={handleChange}
              placeholder="10000.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annual_fee">Annual Fee (Optional)</Label>
            <Input
              id="annual_fee"
              name="annual_fee"
              type="number"
              step="0.01"
              value={formData.annual_fee}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cashback">Cashback (Optional)</Label>
            <Input
              id="cashback"
              name="cashback"
              type="number"
              step="0.01"
              value={formData.cashback}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pending_dues">Pending Dues (Optional)</Label>
            <Input
              id="pending_dues"
              name="pending_dues"
              type="number"
              step="0.01"
              value={formData.pending_dues}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card_image_url">Card Image URL (Optional)</Label>
            <Input
              id="card_image_url"
              name="card_image_url"
              type="url"
              value={formData.card_image_url}
              onChange={handleChange}
              placeholder="https://example.com/card-image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Add a URL to an image of the actual credit card
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apr">APR (Annual Percentage Rate)</Label>
            <Input
              id="apr"
              name="apr"
              type="number"
              step="0.01"
              value={formData.apr}
              onChange={handleChange}
              placeholder="18.99"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Payment Due Date</Label>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rewards_type">Rewards Type</Label>
            <Select
              value={formData.rewards_type}
              onValueChange={(value) =>
                setFormData({ ...formData, rewards_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rewards type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cashback">Cashback</SelectItem>
                <SelectItem value="points">Points</SelectItem>
                <SelectItem value="miles">Miles</SelectItem>
                <SelectItem value="none">No Rewards</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full bg-foreground text-background hover:bg-foreground/90"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Card"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            🔒 Your card information is encrypted
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
