import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Droplets, Wind, CloudSnow, CloudDrizzle, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  const [locationName, setLocationName] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();

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

    const fetchWeatherForLocation = async (lat: number, lon: number, locationText?: string) => {
      try {
        const { data, error } = await supabase.functions.invoke('weather', {
          body: { lat, lon },
        });

        if (error) {
          console.error('Weather API error:', error);
          throw error;
        }

        if (!cancelled && data) {
          setWeatherData(data);
          if (data.location) {
            setLocationName(`${data.location.name}, ${data.location.country}`);
          } else if (locationText) {
            setLocationName(locationText);
          }
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
        toast({
          title: 'Weather Unavailable',
          description: 'Unable to fetch weather data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const fetchWeatherData = async () => {
      try {
        setLoading(true);

        // First, try to get user's stored location from database
        if (user) {
          const { data: userLocation, error: locationError } = await supabase
            .from('user_locations')
            .select('latitude, longitude, city, region, country')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (!locationError && userLocation && userLocation.latitude && userLocation.longitude) {
            console.log('Using stored user location:', userLocation);
            const locationText = [userLocation.city, userLocation.region, userLocation.country]
              .filter(Boolean)
              .join(', ');
            await fetchWeatherForLocation(
              Number(userLocation.latitude), 
              Number(userLocation.longitude),
              locationText
            );
            return;
          }
        }

        // If no stored location, try browser geolocation
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              console.log('Using browser geolocation:', { latitude, longitude });
              
              // Save location for logged-in users
              if (user) {
                try {
                  const response = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                  );
                  const geoData = await response.json();
                  
                  await supabase.from('user_locations').insert({
                    user_id: user.id,
                    latitude,
                    longitude,
                    city: geoData.city || '',
                    region: geoData.principalSubdivision || '',
                    country: geoData.countryName || ''
                  });
                } catch (err) {
                  console.error('Error saving location:', err);
                }
              }

              await fetchWeatherForLocation(latitude, longitude);
            },
            async (geoErr) => {
              console.error('Geolocation error:', geoErr.message);
              toast({
                title: 'Location Access Denied',
                description: 'Please enable location access for accurate weather data.',
                variant: 'default',
              });
              // Use default location as fallback
              setLocationName('New York, USA');
              await fetchWeatherForLocation(40.7128, -74.0060, 'New York, USA');
            },
            { timeout: 10000, enableHighAccuracy: true, maximumAge: 300000 }
          );
        } else {
          // Geolocation not available
          setLocationName('New York, USA');
          await fetchWeatherForLocation(40.7128, -74.0060, 'New York, USA');
        }
      } catch (error) {
        console.error('Error in fetchWeatherData:', error);
        if (!cancelled) setLoading(false);
      }
    };

    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 15 * 60 * 1000); // refresh every 15 minutes

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user, toast]);

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
            {locationName && (
              <div className="flex items-center gap-1 text-sm opacity-90">
                <MapPin className="w-3 h-3" />
                <span>{locationName}</span>
              </div>
            )}
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