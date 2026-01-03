import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language } = await req.json();
    
    console.log('Text-to-speech request:', { textLength: text?.length, language });
    
    if (!text) {
      throw new Error('Text is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use browser's built-in speech synthesis via a workaround:
    // Generate a phonetic/simplified version of the text for better TTS compatibility
    // Since we can't directly generate audio server-side without OpenAI, 
    // we'll return the text formatted for client-side Web Speech API
    
    const isHindi = language === 'hi' || language?.includes('hindi');
    
    // Return the text for client-side TTS using Web Speech API
    return new Response(
      JSON.stringify({ 
        text: text,
        language: isHindi ? 'hi-IN' : 'en-US',
        useWebSpeech: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Text-to-speech error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
