import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function mapWeatherCodeToText(code: number): string {
  // Open-Meteo weather codes mapping
  const mapping: Record<number, string> = {
    0: 'Clear',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Dense drizzle',
    56: 'Freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Rain showers',
    81: 'Heavy rain showers',
    82: 'Violent rain showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
  };
  return mapping[code] ?? 'Unknown';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon } = await req.json();

    if (!lat || !lon) {
      throw new Error('Latitude and longitude are required');
    }

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');

    console.log('Fetching weather for coordinates:', { lat, lon });

    // 1) Try RapidAPI (WeatherAPI.com)
    if (rapidApiKey) {
      const rapidRes = await fetch(
        `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${lat},${lon}&days=4`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com',
          },
        }
      );

      if (rapidRes.ok) {
        const weatherData = await rapidRes.json();

        const dailyForecasts = weatherData.forecast.forecastday.map(
          (day: any, index: number) => {
            const date = new Date(day.date);
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return {
              day: index === 0 ? 'Today' : dayNames[date.getDay()],
              temp: Math.round(day.day.avgtemp_c),
              condition: day.day.condition.text,
              icon: day.day.condition.icon,
            };
          }
        );

        const response = {
          current: {
            temp: Math.round(weatherData.current.temp_c),
            condition: weatherData.current.condition.text,
            humidity: weatherData.current.humidity,
            windSpeed: Math.round(weatherData.current.wind_kph),
            icon: weatherData.current.condition.icon,
            main: weatherData.current.condition.text,
          },
          forecast: dailyForecasts,
          location: {
            name: weatherData.location.name,
            region: weatherData.location.region,
            country: weatherData.location.country,
          },
        };

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        const errorText = await rapidRes.text();
        console.error('Weather API error:', rapidRes.status, errorText);
        // Fall through to Open-Meteo if 4xx/429
      }
    } else {
      console.warn('RAPIDAPI_KEY not set, falling back to Open-Meteo');
    }

    // 2) Fallback to Open-Meteo (no key required)
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      forecast_days: '4',
      timezone: 'auto',
    });

    const meteoRes = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);

    if (!meteoRes.ok) {
      const txt = await meteoRes.text();
      console.error('Open-Meteo error:', meteoRes.status, txt);
      throw new Error(`Weather API error: ${meteoRes.status}`);
    }

    const meteo = await meteoRes.json();

    const nowCode = Number(meteo.current?.weather_code ?? 0);
    const nowCondition = mapWeatherCodeToText(nowCode);

    const dailyForecasts = (meteo.daily?.time ?? []).map((d: string, idx: number) => {
      const date = new Date(d);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const code = Number(meteo.daily.weather_code?.[idx] ?? 0);
      const avgTemp = Math.round(
        ((Number(meteo.daily.temperature_2m_max?.[idx]) ?? 0) + (Number(meteo.daily.temperature_2m_min?.[idx]) ?? 0)) / 2
      );
      return {
        day: idx === 0 ? 'Today' : dayNames[date.getDay()],
        temp: avgTemp,
        condition: mapWeatherCodeToText(code),
        icon: '',
      };
    });

    const response = {
      current: {
        temp: Math.round(Number(meteo.current?.temperature_2m ?? 0)),
        condition: nowCondition,
        humidity: Math.round(Number(meteo.current?.relative_humidity_2m ?? 0)),
        windSpeed: Math.round(Number(meteo.current?.wind_speed_10m ?? 0)),
        icon: '',
        main: nowCondition,
      },
      forecast: dailyForecasts,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in weather function:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});