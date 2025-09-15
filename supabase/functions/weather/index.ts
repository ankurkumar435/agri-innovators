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

    const openWeatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');
    if (!openWeatherApiKey) {
      throw new Error('OpenWeather API key not found');
    }

    // Get current weather
    const currentWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`
    );

    if (!currentWeatherResponse.ok) {
      throw new Error(`Weather API error: ${currentWeatherResponse.status}`);
    }

    const currentWeather = await currentWeatherResponse.json();

    // Get 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`
    );

    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`);
    }

    const forecast = await forecastResponse.json();

    // Process forecast data - get daily forecasts
    const dailyForecasts = [];
    const today = new Date().toDateString();
    
    for (let i = 0; i < forecast.list.length; i += 8) { // Every 8th item (3-hour intervals, so 24/3 = 8)
      if (dailyForecasts.length >= 4) break;
      
      const item = forecast.list[i];
      const date = new Date(item.dt * 1000);
      
      if (date.toDateString() === today && dailyForecasts.length === 0) {
        dailyForecasts.push({
          day: 'Today',
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main,
          icon: item.weather[0].icon
        });
      } else if (date.toDateString() !== today) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dailyForecasts.push({
          day: dayNames[date.getDay()],
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main,
          icon: item.weather[0].icon
        });
      }
    }

    const weatherData = {
      current: {
        temp: Math.round(currentWeather.main.temp),
        condition: currentWeather.weather[0].description,
        humidity: currentWeather.main.humidity,
        windSpeed: Math.round(currentWeather.wind.speed * 3.6), // Convert m/s to km/h
        icon: currentWeather.weather[0].icon,
        main: currentWeather.weather[0].main
      },
      forecast: dailyForecasts
    };

    return new Response(JSON.stringify(weatherData), {
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