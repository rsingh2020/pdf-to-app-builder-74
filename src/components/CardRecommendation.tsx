import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Dining",
  "Groceries",
  "Travel",
  "Gas",
  "Entertainment",
  "Shopping",
  "Utilities",
  "Healthcare",
  "Other",
];

export const CardRecommendation = () => {
  const [category, setCategory] = useState("");
  const [merchant, setMerchant] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState("");
  const { toast } = useToast();

  const getRecommendation = async () => {
    if (!category) {
      toast({
        title: "Category required",
        description: "Please select a purchase category",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("recommend-card", {
        body: { category, merchant: merchant || null },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setRecommendation(data.recommendation);
    } catch (error: any) {
      console.error("Recommendation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get recommendation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Best Card to Use</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Get AI-powered recommendations for your next purchase
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Purchase Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="merchant">Merchant (Optional)</Label>
            <Input
              id="merchant"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g., Starbucks, Target"
            />
          </div>

          <Button
            onClick={getRecommendation}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Get Recommendation
              </>
            )}
          </Button>

          {recommendation && (
            <div className="mt-4 p-4 bg-background rounded-lg border border-border">
              <p className="text-sm whitespace-pre-wrap">{recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};