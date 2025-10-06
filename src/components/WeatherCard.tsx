import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Droplets, Wind, CloudSnow, CloudDrizzle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
    main: string;
  };
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
    icon: string;
  }>;
}

export const WeatherCard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Get weather icon component based on condition
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition?.toLowerCase() || '';
    
    if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
      return Sun;
    } else if (lowerCondition.includes('rain')) {
      return CloudRain;
    } else if (lowerCondition.includes('drizzle')) {
      return CloudDrizzle;
    } else if (lowerCondition.includes('snow')) {
      return CloudSnow;
    } else if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
      return Cloud;
    }
    return Cloud;
  };

  useEffect(() => {
    let cancelled = false;

    const fetchDefaultWeather = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('weather', {
          body: { lat: 40.7128, lon: -74.0060 },
        });

        if (error) {
          console.error('Default weather API error:', error);
          throw error;
        }

        if (!cancelled && data) setWeatherData(data);
      } catch (error) {
        console.error('Error fetching default weather:', error);
        toast({
          title: 'Weather Unavailable',
          description: 'Weather data is not showing at this time.',
          variant: 'destructive',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              try {
                const { data, error } = await supabase.functions.invoke('weather', {
                  body: { lat: latitude, lon: longitude },
                });

                if (error) {
                  console.error('Weather API error:', error);
                  throw error;
                }

                if (!cancelled) setWeatherData(data);
              } catch (err) {
                console.error('Error calling weather function:', err);
                await fetchDefaultWeather();
              } finally {
                if (!cancelled) setLoading(false);
              }
            },
            async (geoErr) => {
              console.error('Geolocation error:', geoErr);
              await fetchDefaultWeather();
            },
            { timeout: 10000, enableHighAccuracy: false }
          );
        } else {
          await fetchDefaultWeather();
        }
      } catch (error) {
        console.error('Error in fetchWeatherData:', error);
        toast({
          title: 'Weather Error',
          description: 'Weather data is not showing at this time.',
          variant: 'destructive',
        });
        if (!cancelled) setLoading(false);
      }
    };

    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 15 * 60 * 1000); // refresh every 15 minutes

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [toast]);

  if (loading) {
    return (
      <Card className="p-4 bg-gradient-sky border-0 text-white">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded mb-2"></div>
          <div className="h-4 bg-white/20 rounded mb-4"></div>
          <div className="h-8 bg-white/20 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!weatherData) {
    return (
      <Card className="p-4 bg-gradient-sky border-0 text-white">
        <div className="text-center">
          <p>Weather data unavailable</p>
        </div>
      </Card>
    );
  }

  const CurrentIcon = getWeatherIcon(weatherData.current.main);

  return (
    <Card className="p-4 bg-gradient-sky border-0 text-white">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Weather Forecast</h3>
            <p className="text-sm opacity-90">Current conditions</p>
          </div>
          <CurrentIcon className="w-8 h-8" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{weatherData.current.temp}°C</div>
            <div className="text-sm opacity-90">{weatherData.current.condition}</div>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              <span>{weatherData.current.humidity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4" />
              <span>{weatherData.current.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-2 border-t border-white/20">
          {weatherData.forecast.map((day) => {
            const DayIcon = getWeatherIcon(day.condition);
            return (
              <div key={day.day} className="text-center">
                <div className="text-xs opacity-90">{day.day}</div>
                <DayIcon className="w-5 h-5 mx-auto my-1" />
                <div className="text-sm font-medium">{day.temp}°</div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};