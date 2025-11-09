import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate and sanitize inputs
    if (typeof body.amount !== 'number' || body.amount <= 0 || body.amount > 1000000) {
      return new Response(
        JSON.stringify({ error: 'Amount must be a positive number less than 1,000,000' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!body.category || typeof body.category !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Category is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const amount = body.amount;
    const category = body.category.trim().slice(0, 50);
    const description = body.description ? body.description.toString().trim().slice(0, 500) : undefined;
    console.log("Assess purchase request:", { amount, category, description });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Fetch user's cards
    const { data: cards, error: cardsError } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id);

    if (cardsError) throw cardsError;

    // Calculate total credit situation
    const totalCreditLimit = cards?.reduce((sum, card) => sum + Number(card.credit_limit), 0) || 0;
    const totalBalance = cards?.reduce((sum, card) => sum + Number(card.balance), 0) || 0;
    const availableCredit = totalCreditLimit - totalBalance;
    const currentUtilization = totalCreditLimit > 0 ? (totalBalance / totalCreditLimit) * 100 : 0;
    const afterUtilization = totalCreditLimit > 0 ? ((totalBalance + amount) / totalCreditLimit) * 100 : 0;

    const systemPrompt = `You are a financial advisor helping users make smart purchasing decisions. Analyze their credit situation and provide a verdict on whether they should make a purchase.

Provide your response as a structured assessment with:
1. **Verdict**: ✅ Buy Now, 🕒 Wait, or 💡 Plan to Save
2. **Rationale**: Brief explanation of the financial impact
3. **Recommended Card**: Which card to use (if Buy Now)
4. **Action**: Specific next step

Keep it concise but informative.`;

    const userPrompt = `Should I make this purchase?

Purchase Details:
- Amount: $${amount}
- Category: ${category}
- Description: ${description || 'Not specified'}

My Financial Situation:
- Total Credit Limit: $${totalCreditLimit}
- Current Balance: $${totalBalance}
- Available Credit: $${availableCredit}
- Current Utilization: ${currentUtilization.toFixed(1)}%
- Utilization After Purchase: ${afterUtilization.toFixed(1)}%

My Cards:
${cards?.map(card => `
- ${card.card_name}:
  * Available: $${(Number(card.credit_limit) - Number(card.balance)).toFixed(2)}
  * Utilization: ${Math.round((Number(card.balance) / Number(card.credit_limit)) * 100)}%
  * Rewards: ${card.rewards_type || 'cashback'}
  * APR: ${card.apr}%
`).join('\n')}

Assess this purchase and give me your verdict.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const assessment = data.choices[0].message.content;

    return new Response(
      JSON.stringify({
        assessment,
        financialSnapshot: {
          currentUtilization,
          afterUtilization,
          availableCredit,
          impactOnBudget: (amount / availableCredit) * 100
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in assess-purchase:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});