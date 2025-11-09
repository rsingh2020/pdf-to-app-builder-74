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
import { Brain, Loader2, CheckCircle, Clock, Lightbulb } from "lucide-react";
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

export const PurchaseAssessment = () => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState("");
  const [verdict, setVerdict] = useState<"buy" | "wait" | "plan" | null>(null);
  const { toast } = useToast();

  const assessPurchase = async () => {
    if (!amount || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in amount and category",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("assess-purchase", {
        body: {
          amount: parseFloat(amount),
          category,
          description,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setAssessment(data.assessment);

      // Determine verdict from AI response
      const assessmentLower = data.assessment.toLowerCase();
      if (assessmentLower.includes("✅") || assessmentLower.includes("buy now")) {
        setVerdict("buy");
      } else if (assessmentLower.includes("🕒") || assessmentLower.includes("wait")) {
        setVerdict("wait");
      } else if (assessmentLower.includes("💡") || assessmentLower.includes("plan")) {
        setVerdict("plan");
      }
    } catch (error: any) {
      console.error("Assessment error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assess purchase",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getVerdictIcon = () => {
    switch (verdict) {
      case "buy":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "wait":
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case "plan":
        return <Lightbulb className="h-6 w-6 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-card bg-gradient-to-br from-blue-500/5 to-purple-500/5">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-foreground">Should I Buy This?</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Get AI-powered financial advice before making a purchase
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Purchase Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
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
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you buying?"
            />
          </div>

          <Button
            onClick={assessPurchase}
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
                <Brain className="mr-2 h-4 w-4" />
                Assess Purchase
              </>
            )}
          </Button>

          {assessment && (
            <div className="mt-4 p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                {getVerdictIcon()}
                <p className="font-semibold text-foreground">Financial Assessment</p>
              </div>
              <p className="text-sm whitespace-pre-wrap">{assessment}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};