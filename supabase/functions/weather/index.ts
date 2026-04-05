import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const bodySchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

interface WeatherAlert {
  type: 'warning' | 'watch' | 'advisory';
  severity: 'extreme' | 'severe' | 'moderate' | 'minor';
  title: string;
  description: string;
  icon: string;
}

function mapWeatherCodeToText(code: number): string {
  const mapping: Record<number, string> = {
    0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
    56: 'Freezing drizzle', 57: 'Dense freezing drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
    66: 'Freezing rain', 67: 'Heavy freezing rain',
    71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
    80: 'Rain showers', 81: 'Heavy rain showers', 82: 'Violent rain showers',
    85: 'Snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail',
  };
  return mapping[code] ?? 'Unknown';
}

function generateWeatherAlerts(weatherCode: number, temp: number, windSpeed: number, humidity: number): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  if (temp >= 40) {
    alerts.push({ type: 'warning', severity: 'extreme', title: 'Extreme Heat Warning', description: `Dangerously high temperature of ${temp}°C. Stay indoors, hydrate frequently, and avoid strenuous activities.`, icon: 'heat' });
  } else if (temp >= 35) {
    alerts.push({ type: 'advisory', severity: 'moderate', title: 'Heat Advisory', description: `High temperature of ${temp}°C expected. Take precautions and ensure adequate irrigation.`, icon: 'heat' });
  }
  if (temp <= -10) {
    alerts.push({ type: 'warning', severity: 'extreme', title: 'Extreme Cold Warning', description: `Dangerously low temperature of ${temp}°C. Protect crops from frost.`, icon: 'cold' });
  } else if (temp <= 0) {
    alerts.push({ type: 'advisory', severity: 'moderate', title: 'Frost Advisory', description: `Freezing temperature of ${temp}°C. Cover sensitive plants.`, icon: 'cold' });
  }
  if (weatherCode >= 95) {
    alerts.push({ type: 'warning', severity: 'severe', title: 'Thunderstorm Warning', description: 'Severe thunderstorm in the area. Seek shelter immediately.', icon: 'storm' });
  }
  if ([65, 67, 81, 82].includes(weatherCode)) {
    alerts.push({ type: 'warning', severity: 'severe', title: 'Heavy Rain Warning', description: 'Heavy rainfall expected. Risk of flooding in low-lying areas.', icon: 'rain' });
  } else if ([61, 63, 66, 80].includes(weatherCode)) {
    alerts.push({ type: 'advisory', severity: 'moderate', title: 'Rain Advisory', description: 'Moderate rain expected. Plan field activities accordingly.', icon: 'rain' });
  }
  if ([75, 86].includes(weatherCode)) {
    alerts.push({ type: 'warning', severity: 'severe', title: 'Heavy Snow Warning', description: 'Heavy snowfall expected. Protect livestock and greenhouse structures.', icon: 'snow' });
  }
  if (windSpeed >= 60) {
    alerts.push({ type: 'warning', severity: 'severe', title: 'High Wind Warning', description: `Strong winds of ${windSpeed} km/h. Secure loose equipment.`, icon: 'wind' });
  } else if (windSpeed >= 40) {
    alerts.push({ type: 'advisory', severity: 'moderate', title: 'Wind Advisory', description: `Gusty winds of ${windSpeed} km/h expected.`, icon: 'wind' });
  }
  if (humidity <= 20 && temp >= 30) {
    alerts.push({ type: 'advisory', severity: 'moderate', title: 'Drought Conditions', description: `Very low humidity (${humidity}%) combined with high temperature. Increase irrigation.`, icon: 'drought' });
  }
  if ([45, 48].includes(weatherCode)) {
    alerts.push({ type: 'advisory', severity: 'minor', title: 'Fog Advisory', description: 'Dense fog expected. Reduced visibility may affect transportation.', icon: 'fog' });
  }
  return alerts;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Input validation
    const rawBody = await req.json();
    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid coordinates' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { lat, lon } = parsed.data;

    console.log('Fetching weather for coordinates:', { lat, lon });

    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      forecast_days: '7',
      timezone: 'auto',
    });

    const meteoRes = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);

    if (!meteoRes.ok) {
      console.error('Open-Meteo error:', meteoRes.status);
      throw new Error('Weather API error');
    }

    const meteo = await meteoRes.json();

    const nowCode = Number(meteo.current?.weather_code ?? 0);
    const nowCondition = mapWeatherCodeToText(nowCode);
    const currentTemp = Math.round(Number(meteo.current?.temperature_2m ?? 0));
    const currentHumidity = Math.round(Number(meteo.current?.relative_humidity_2m ?? 0));
    const currentWindSpeed = Math.round(Number(meteo.current?.wind_speed_10m ?? 0));

    const dailyForecasts = (meteo.daily?.time ?? []).map((d: string, idx: number) => {
      const date = new Date(d);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const code = Number(meteo.daily.weather_code?.[idx] ?? 0);
      const avgTemp = Math.round(
        ((Number(meteo.daily.temperature_2m_max?.[idx]) ?? 0) + (Number(meteo.daily.temperature_2m_min?.[idx]) ?? 0)) / 2
      );
      return { day: idx === 0 ? 'Today' : dayNames[date.getDay()], temp: avgTemp, condition: mapWeatherCodeToText(code), icon: '' };
    });

    const alerts = generateWeatherAlerts(nowCode, currentTemp, currentWindSpeed, currentHumidity);

    let locationName = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'User-Agent': 'AgriInnovators/1.0' } }
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        locationName = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || locationName;
      }
    } catch (geoError) {
      console.log('Geocoding failed, using coordinates as location name');
    }

    const response = {
      current: { temp: currentTemp, condition: nowCondition, humidity: currentHumidity, windSpeed: currentWindSpeed, icon: '', main: nowCondition },
      forecast: dailyForecasts,
      location: { name: locationName },
      alerts,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in weather function:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
