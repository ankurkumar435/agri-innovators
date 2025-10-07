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
      throw new Error('Hugging Face API key not found');
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
          const weatherResponse = await fetch(`${supabaseUrl}/functions/v1/weather`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ lat, lon }),
          });

          if (weatherResponse.ok) {
            weatherData = await weatherResponse.json();
            console.log('Weather data fetched successfully');
          }
        }
      } catch (weatherError) {
        console.error('Error fetching weather:', weatherError);
      }
    }

    const hf = new HfInference(huggingFaceApiKey);

    const systemPrompt = `You are FarmBot AI, a helpful farming assistant specialized in agriculture, crop management, weather patterns, pest control, soil health, market trends, and sustainable farming practices. 

CRITICAL: You MUST respond in the SAME LANGUAGE as the user's message. If the user writes in Hindi, respond in Hindi. If in English, respond in English. If in any other language, respond in that language.

You provide practical, actionable advice to farmers. Keep responses concise but informative. Focus on:

- Crop cultivation and best practices
- Pest and disease management
- Weather and seasonal advice
- Soil health and fertilization
- Market trends and pricing
- Sustainable farming techniques
- Equipment and technology recommendations

${weatherData ? `Current weather information:\nTemperature: ${weatherData.current.temp}°C\nCondition: ${weatherData.current.condition}\nHumidity: ${weatherData.current.humidity}%\nWind Speed: ${weatherData.current.windSpeed} km/h\n\nUse this weather data to provide relevant farming advice.` : ''}

Always be encouraging and supportive to farmers, understanding their challenges and providing solutions.`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${message}\nAssistant:`;

    console.log('Calling Hugging Face API...');
    const response = await hf.textGeneration({
      model: 'zai-org/GLM-4.6',
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        return_full_text: false,
      },
    });

    const reply = response.generated_text;
    console.log('AI response generated successfully');

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