import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { lat, lon } = await req.json();

    if (!lat || !lon) {
      throw new Error('Latitude and longitude are required');
    }

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidApiKey) {
      throw new Error('RapidAPI key not found');
    }

    console.log('Fetching weather for coordinates:', { lat, lon });

    // Get current weather and forecast from WeatherAPI.com via RapidAPI
    const weatherResponse = await fetch(
      `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${lat},${lon}&days=4`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
        }
      }
    );

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('Weather API error:', weatherResponse.status, errorText);
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    console.log('Weather data received successfully');

    // Process forecast data
    const dailyForecasts = weatherData.forecast.forecastday.map((day: any, index: number) => {
      const date = new Date(day.date);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      return {
        day: index === 0 ? 'Today' : dayNames[date.getDay()],
        temp: Math.round(day.day.avgtemp_c),
        condition: day.day.condition.text,
        icon: day.day.condition.icon
      };
    });

    const response = {
      current: {
        temp: Math.round(weatherData.current.temp_c),
        condition: weatherData.current.condition.text,
        humidity: weatherData.current.humidity,
        windSpeed: Math.round(weatherData.current.wind_kph),
        icon: weatherData.current.condition.icon,
        main: weatherData.current.condition.text
      },
      forecast: dailyForecasts,
      location: {
        name: weatherData.location.name,
        region: weatherData.location.region,
        country: weatherData.location.country
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in weather function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});