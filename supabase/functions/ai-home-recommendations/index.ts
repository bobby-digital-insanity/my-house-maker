import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vibe } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Available room types and styles from the app
    const availableOptions = {
      kitchen: ["Modern", "Rustic", "Industrial", "60's Retro", "Minimalist", "Traditional"],
      "living-room": ["Modern", "Rustic", "Industrial", "60's Retro", "Minimalist", "Traditional"],
      garage: ["Modern", "Rustic", "Industrial", "60's Retro", "Minimalist", "Traditional"],
      basement: ["Modern", "Rustic", "Industrial", "60's Retro", "Minimalist", "Traditional"],
      "home-office": ["Lumber Baron", "Day Trader", "Software Solutions Engineer", "Executive Suite", "Creative Studio", "Telemarketer Dungeon"],
      neighbors: ["Retired Couple", "Young Couple", "Single Professional", "Frat House", "Airbnb Rental", "Cat Collector"],
      weather: ["Sunny", "Cloudy", "Rainy", "Heat Wave", "Arctic", "Sharknado"],
      scenery: ["Forest", "Mountain", "Desert", "Beach", "Countryside", "Active Volcano"]
    };

    const systemPrompt = `You are a home design expert AI. Based on the user's vibe description, recommend specific room styles from the available options.

Available room types and styles:
${JSON.stringify(availableOptions, null, 2)}

Return your recommendations in JSON format with an array of recommendations. Each recommendation should have:
- roomType: The room category (e.g., "Kitchen", "Living Room", "Home Office", "Neighbors", "Weather", "Scenery")
- styleName: The specific style from the available options
- reason: A brief, personalized explanation (1-2 sentences) of why this choice fits their vibe
- price: Estimated price based on typical costs

Price guidelines:
- Kitchen: $35k-48k
- Living Room: $26k-35k
- Garage: $14k-18k
- Basement: $28k-36k
- Home Office: $5k-45k (Telemarketer Dungeon is only $5k)
- Neighbors: $2k-6k
- Weather: $1k-8k
- Scenery: $3k-18k

Recommend 4-6 selections from different categories that best match their vibe.`;

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
          { role: "user", content: `My ideal home vibe: ${vibe}` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_recommendations",
              description: "Provide home design recommendations based on user's vibe",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        roomType: { type: "string" },
                        styleName: { type: "string" },
                        reason: { type: "string" },
                        price: { type: "number" }
                      },
                      required: ["roomType", "styleName", "reason", "price"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["recommendations"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_recommendations" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call response from AI");
    }

    const recommendations = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(recommendations),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-home-recommendations:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
