import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    if (!message) {
      throw new Error('No message provided');
    }

    const huggingFaceApiKey = Deno.env.get('HUGGINGFACE_API_KEY');
    if (!huggingFaceApiKey) {
      throw new Error('Hugging Face API key not found');
    }

    const hf = new HfInference(huggingFaceApiKey);

    const systemPrompt = `You are FarmBot AI, a helpful farming assistant specialized in agriculture, crop management, weather patterns, pest control, soil health, market trends, and sustainable farming practices. You provide practical, actionable advice to farmers. Keep responses concise but informative. Focus on:

- Crop cultivation and best practices
- Pest and disease management
- Weather and seasonal advice
- Soil health and fertilization
- Market trends and pricing
- Sustainable farming techniques
- Equipment and technology recommendations

Always be encouraging and supportive to farmers, understanding their challenges and providing solutions.`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${message}\nAssistant:`;

    const response = await hf.textGeneration({
      model: 'meta-llama/Llama-2-7b-chat-hf',
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        return_full_text: false,
      },
    });

    const reply = response.generated_text;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});