import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherAlert {
  type: 'warning' | 'watch' | 'advisory';
  severity: 'extreme' | 'severe' | 'moderate' | 'minor';
  title: string;
  description: string;
  icon: string;
}

function mapWeatherCodeToText(code: number): string {
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

function generateWeatherAlerts(
  weatherCode: number,
  temp: number,
  windSpeed: number,
  humidity: number
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  // Extreme heat alert (>40°C)
  if (temp >= 40) {
    alerts.push({
      type: 'warning',
      severity: 'extreme',
      title: 'Extreme Heat Warning',
      description: `Dangerously high temperature of ${temp}°C. Stay indoors, hydrate frequently, and avoid strenuous activities. Protect livestock and crops.`,
      icon: 'heat',
    });
  } else if (temp >= 35) {
    alerts.push({
      type: 'advisory',
      severity: 'moderate',
      title: 'Heat Advisory',
      description: `High temperature of ${temp}°C expected. Take precautions and ensure adequate irrigation for crops.`,
      icon: 'heat',
    });
  }

  // Extreme cold alert (<0°C)
  if (temp <= -10) {
    alerts.push({
      type: 'warning',
      severity: 'extreme',
      title: 'Extreme Cold Warning',
      description: `Dangerously low temperature of ${temp}°C. Protect crops from frost and ensure livestock shelter.`,
      icon: 'cold',
    });
  } else if (temp <= 0) {
    alerts.push({
      type: 'advisory',
      severity: 'moderate',
      title: 'Frost Advisory',
      description: `Freezing temperature of ${temp}°C. Cover sensitive plants and protect water pipes.`,
      icon: 'cold',
    });
  }

  // Storm and severe weather based on weather code
  if (weatherCode >= 95) {
    alerts.push({
      type: 'warning',
      severity: 'severe',
      title: 'Thunderstorm Warning',
      description: 'Severe thunderstorm in the area. Seek shelter immediately. Secure farm equipment and livestock.',
      icon: 'storm',
    });
  }

  // Heavy rain alerts
  if ([65, 67, 81, 82].includes(weatherCode)) {
    alerts.push({
      type: 'warning',
      severity: 'severe',
      title: 'Heavy Rain Warning',
      description: 'Heavy rainfall expected. Risk of flooding in low-lying areas. Ensure proper drainage in fields.',
      icon: 'rain',
    });
  } else if ([61, 63, 66, 80].includes(weatherCode)) {
    alerts.push({
      type: 'advisory',
      severity: 'moderate',
      title: 'Rain Advisory',
      description: 'Moderate rain expected. Plan field activities accordingly.',
      icon: 'rain',
    });
  }

  // Heavy snow alerts
  if ([75, 86].includes(weatherCode)) {
    alerts.push({
      type: 'warning',
      severity: 'severe',
      title: 'Heavy Snow Warning',
      description: 'Heavy snowfall expected. Protect livestock and greenhouse structures.',
      icon: 'snow',
    });
  }

  // High wind alert
  if (windSpeed >= 60) {
    alerts.push({
      type: 'warning',
      severity: 'severe',
      title: 'High Wind Warning',
      description: `Strong winds of ${windSpeed} km/h. Secure loose equipment, support tall crops, and avoid outdoor spraying.`,
      icon: 'wind',
    });
  } else if (windSpeed >= 40) {
    alerts.push({
      type: 'advisory',
      severity: 'moderate',
      title: 'Wind Advisory',
      description: `Gusty winds of ${windSpeed} km/h expected. Consider delaying pesticide application.`,
      icon: 'wind',
    });
  }

  // Low humidity (drought risk)
  if (humidity <= 20 && temp >= 30) {
    alerts.push({
      type: 'advisory',
      severity: 'moderate',
      title: 'Drought Conditions',
      description: `Very low humidity (${humidity}%) combined with high temperature. Increase irrigation and monitor soil moisture.`,
      icon: 'drought',
    });
  }

  // Fog advisory
  if ([45, 48].includes(weatherCode)) {
    alerts.push({
      type: 'advisory',
      severity: 'minor',
      title: 'Fog Advisory',
      description: 'Dense fog expected. Reduced visibility may affect transportation. Watch for fungal disease conditions.',
      icon: 'fog',
    });
  }

  return alerts;
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

    console.log('Fetching weather for coordinates:', { lat, lon });

    // Always use Open-Meteo (free, no API key required, reliable)
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
      return {
        day: idx === 0 ? 'Today' : dayNames[date.getDay()],
        temp: avgTemp,
        condition: mapWeatherCodeToText(code),
        icon: '',
      };
    });

    // Generate weather alerts based on current conditions
    const alerts = generateWeatherAlerts(nowCode, currentTemp, currentWindSpeed, currentHumidity);

    // Try to get location name via reverse geocoding (optional enhancement)
    let locationName = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'User-Agent': 'AgriInnovators/1.0' } }
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        locationName = geoData.address?.city || 
                       geoData.address?.town || 
                       geoData.address?.village || 
                       geoData.address?.county ||
                       locationName;
      }
    } catch (geoError) {
      console.log('Geocoding failed, using coordinates as location name');
    }

    const response = {
      current: {
        temp: currentTemp,
        condition: nowCondition,
        humidity: currentHumidity,
        windSpeed: currentWindSpeed,
        icon: '',
        main: nowCondition,
      },
      forecast: dailyForecasts,
      location: {
        name: locationName,
      },
      alerts,
    };

    console.log('Weather data fetched successfully for:', locationName);

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