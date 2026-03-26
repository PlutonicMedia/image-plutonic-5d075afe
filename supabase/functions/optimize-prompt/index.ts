import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { prompt } = await req.json();
    if (!prompt) throw new Error("prompt is required");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a professional commercial photography prompt engineer. The user will give you a rough creative idea. Analyze the intent and return structured scene parameters that will produce a stunning, photorealistic ad image. Be specific and detailed with lighting, camera, and scene descriptions.",
          },
          {
            role: "user",
            content: `Optimize this creative prompt for photorealistic ad image generation:\n\n${prompt}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "optimize_prompt",
              description: "Return structured scene parameters for photorealistic image generation",
              parameters: {
                type: "object",
                properties: {
                  scene_description: { type: "string", description: "Detailed environment/scene description (2-3 sentences)" },
                  lighting_style: { type: "string", description: "Specific lighting setup description" },
                  camera_lens: { type: "string", description: "Camera lens and settings (e.g. '85mm f/1.8, shallow DoF')" },
                  camera_angle: { type: "string", description: "Camera angle and perspective" },
                  artistic_style: { type: "string", description: "Overall artistic/aesthetic style" },
                },
                required: ["scene_description", "lighting_style", "camera_lens", "camera_angle", "artistic_style"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "optimize_prompt" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const optimized = JSON.parse(toolCall.function.arguments);

    // Build a human-readable optimized prompt from the structured fields
    const parts = [
      optimized.scene_description,
      `Lighting: ${optimized.lighting_style}`,
      `Camera: ${optimized.camera_lens}, ${optimized.camera_angle}`,
      `Style: ${optimized.artistic_style}`,
    ];

    return new Response(JSON.stringify({
      optimizedPrompt: parts.join('. '),
      structured: optimized,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("optimize-prompt error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
