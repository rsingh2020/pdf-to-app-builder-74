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
    if (!body.category || typeof body.category !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Category is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const category = body.category.trim().slice(0, 50);
    const merchant = body.merchant ? body.merchant.toString().trim().slice(0, 100) : undefined;
    console.log("Recommend card request:", { category, merchant });

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

    // Fetch user's cards with their reward structures
    const { data: cards, error: cardsError } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id);

    if (cardsError) throw cardsError;

    // Fetch active offers for the category
    const { data: offers, error: offersError } = await supabase
      .from("card_offers")
      .select("*")
      .eq("category", category)
      .eq("is_active", true);

    if (offersError) console.log("Offers error:", offersError);

    const systemPrompt = `You are an expert credit card advisor. Analyze the user's cards and recommend the best one to use for a purchase.

Consider:
1. Card rewards type (cashback, points, miles) and rates
2. Active offers and promotions
3. Current utilization (avoid cards near limit)
4. APR if they might carry a balance
5. Any category-specific bonuses

Provide a clear, actionable recommendation with reasoning.`;

    const userPrompt = `I want to make a purchase${merchant ? ` at ${merchant}` : ""} in the ${category} category.

My cards:
${cards?.map(card => `
- ${card.card_name} (${card.card_type}):
  * Rewards: ${card.rewards_type || 'cashback'}
  * Balance: $${card.balance} / Limit: $${card.credit_limit}
  * Utilization: ${Math.round((card.balance / card.credit_limit) * 100)}%
  * APR: ${card.apr}%
  * Annual Fee: $${card.annual_fee}
`).join('\n')}

${offers && offers.length > 0 ? `Active offers for ${category}:
${offers.map(o => `- ${o.card_type}: ${o.reward_rate}% ${o.offer_type} at ${o.merchant_name || 'all merchants'}`).join('\n')}` : ''}

Which card should I use and why? Keep it brief and actionable.`;

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
    const recommendation = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ recommendation, cards, offers }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in recommend-card:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});