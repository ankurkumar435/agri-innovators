import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, userLat, userLon } = await req.json();
    
    if (!message) {
      throw new Error('No message provided');
    }

    console.log('Received message:', message);

    const huggingFaceApiKey = Deno.env.get('HUGGINGFACE_API_KEY');
    if (!huggingFaceApiKey) {
      console.warn('HUGGINGFACE_API_KEY not found, will fall back to Lovable AI gateway if needed');
    }
    // Check if message is asking about weather
    const weatherKeywords = ['weather', 'temperature', 'rain', 'climate', 'forecast', 'sunny', 'cloudy', 
                             'मौसम', 'तापमान', 'बारिश', 'जलवायु', 'धूप', 'बादल',
                             'temps', 'tiempo', 'clima', 'lluvia'];
    const isWeatherQuery = weatherKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    let weatherData = null;
    if (isWeatherQuery) {
      console.log('Weather query detected, fetching weather data...');
      try {
        // Get user location
        let lat = userLat;
        let lon = userLon;

        if (!lat || !lon) {
          if (userId) {
            const { data: locationData } = await supabase
              .from('user_locations')
              .select('latitude, longitude')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (locationData) {
              lat = locationData.latitude;
              lon = locationData.longitude;
            }
          }
        }

        // Fetch weather if we have coordinates
        if (lat && lon) {
          const { data: weatherInvokeData, error: weatherInvokeError } = await supabase.functions.invoke('weather', {
            body: { lat, lon }
          });

          if (weatherInvokeError) {
            console.error('Error invoking weather function:', weatherInvokeError);
          } else {
            weatherData = weatherInvokeData;
            console.log('Weather data fetched successfully');
          }
        }
      } catch (weatherError) {
        console.error('Error fetching weather:', weatherError);
      }
    }

    const hf = huggingFaceApiKey ? new HfInference(huggingFaceApiKey) : null;

    const systemPrompt = `You are FarmBot AI, a helpful farming assistant specialized in agriculture, crop management, weather patterns, pest control, soil health, market trends, and sustainable farming practices. 

CRITICAL: You MUST respond in the SAME LANGUAGE as the user's message. If the user writes in Hindi, respond in Hindi. If in English, respond in English. If in any other language, respond in that language.

FORMATTING RULES:
- Use bullet points (•) for lists
- Keep paragraphs short (2-3 sentences max)
- Add blank lines between sections
- Use simple, clear language
- Avoid markdown symbols like *, #, or backticks

You provide practical, actionable advice to farmers. Focus on:
• Crop cultivation and best practices
• Pest and disease management
• Weather and seasonal advice
• Soil health and fertilization
• Market trends and pricing
• Sustainable farming techniques

${weatherData ? `Current weather information:
• Temperature: ${weatherData.current.temp}°C
• Condition: ${weatherData.current.condition}
• Humidity: ${weatherData.current.humidity}%
• Wind Speed: ${weatherData.current.windSpeed} km/h

Use this weather data to provide relevant farming advice.` : ''}

Always be encouraging and supportive to farmers, understanding their challenges and providing solutions.`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${message}\nAssistant:`;

    let reply = '';
    try {
      if (!hf) throw new Error('Hugging Face not configured');
      console.log('Calling Hugging Face API with Qwen2.5-7B-Instruct...');
      const hfResp = await hf.textGeneration({
        model: 'Qwen/Qwen2.5-7B-Instruct',
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false,
        },
      });
      reply = hfResp.generated_text;
      console.log('AI response generated via Hugging Face');
    } catch (hfError) {
      console.error('Hugging Face failed, falling back to Lovable AI:', hfError);
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('AI configuration error: LOVABLE_API_KEY missing and Hugging Face failed');
      }
      const gatewayResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          stream: false,
        }),
      });

      if (!gatewayResp.ok) {
        const t = await gatewayResp.text();
        console.error('Lovable AI gateway error:', gatewayResp.status, t);
        if (gatewayResp.status === 429) {
          throw new Error('Rate limits exceeded, please try again later.');
        }
        if (gatewayResp.status === 402) {
          throw new Error('Payment required, please add funds to your Lovable AI workspace.');
        }
        throw new Error('AI gateway error');
      }
      const gatewayJson = await gatewayResp.json();
      reply = gatewayJson.choices?.[0]?.message?.content ?? '';
      console.log('AI response generated via Lovable AI');
    }

    // Clean up markdown formatting for better readability
    reply = reply
      .replace(/\*\*\*(.*?)\*\*\*/g, '$1')  // Remove ***text***
      .replace(/\*\*(.*?)\*\*/g, '$1')       // Remove **text**
      .replace(/\*(.*?)\*/g, '$1')           // Remove *text*
      .replace(/#{1,6}\s?/g, '')             // Remove # headers
      .replace(/`{1,3}[^`]*`{1,3}/g, (match) => match.replace(/`/g, ''))  // Remove code backticks
      .replace(/\n{3,}/g, '\n\n')            // Reduce multiple newlines
      .trim();

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred processing your request',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});