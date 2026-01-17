import React, { useState, useEffect, useCallback } from 'react';
import { Cloud, CloudRain, Sun, Droplets, Wind, CloudSnow, CloudDrizzle, MapPin, RefreshCw, AlertTriangle, Thermometer, Snowflake, CloudLightning, CloudFog, Database } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useOfflineCache, getCacheAge } from '@/hooks/useOfflineCache';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface WeatherAlert {
  type: 'warning' | 'watch' | 'advisory';
  severity: 'extreme' | 'severe' | 'moderate' | 'minor';
  title: string;
  description: string;
  icon: string;
}

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
  location?: {
    name: string;
    region: string;
    country: string;
  };
  alerts?: WeatherAlert[];
}

export const WeatherCard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationName, setLocationName] = useState<string>('');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isOnline } = useOnlineStatus();
  const { cachedData, isFromCache, saveToCache } = useOfflineCache<WeatherData>('weather_data', { expirationMinutes: 60 });

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

  // Get alert icon based on alert type
  const getAlertIcon = (iconType: string) => {
    switch (iconType) {
      case 'heat':
        return Thermometer;
      case 'cold':
      case 'snow':
        return Snowflake;
      case 'storm':
        return CloudLightning;
      case 'rain':
        return CloudRain;
      case 'wind':
        return Wind;
      case 'fog':
        return CloudFog;
      default:
        return AlertTriangle;
    }
  };

  // Get alert color based on severity
  const getAlertStyles = (severity: string) => {
    switch (severity) {
      case 'extreme':
        return 'bg-red-500/20 border-red-500 text-red-100';
      case 'severe':
        return 'bg-orange-500/20 border-orange-500 text-orange-100';
      case 'moderate':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-100';
      default:
        return 'bg-blue-500/20 border-blue-500 text-blue-100';
    }
  };

  const fetchWeatherForLocation = useCallback(async (lat: number, lon: number, locationText?: string) => {
    // If offline, use cached data
    if (!isOnline) {
      const cached = localStorage.getItem('farmsmart_cache_weather_data');
      if (cached) {
        try {
          const parsedCached = JSON.parse(cached);
          setWeatherData(parsedCached);
          setCurrentCoords({ lat, lon });
          if (parsedCached.location) {
            setLocationName(`${parsedCached.location.name}, ${parsedCached.location.country}`);
          }
          toast({
            title: 'Using cached weather data',
            description: `Last updated: ${getCacheAge('weather_data') || 'recently'}`,
          });
        } catch (e) {
          console.error('Error parsing cached data:', e);
        }
      }
      return;
    }

    try {
      console.log('Fetching weather for:', { lat, lon });
      const { data, error } = await supabase.functions.invoke('weather', {
        body: { lat, lon },
      });

      if (error) {
        console.error('Weather API error:', error);
        throw error;
      }

      if (data) {
        setWeatherData(data);
        saveToCache(data); // Cache the weather data
        setCurrentCoords({ lat, lon });
        if (data.location) {
          setLocationName(`${data.location.name}, ${data.location.country}`);
        } else if (locationText) {
          setLocationName(locationText);
        }

        // Show toast for severe weather alerts
        if (data.alerts && data.alerts.length > 0) {
          const severeAlerts = data.alerts.filter(
            (a: WeatherAlert) => a.severity === 'extreme' || a.severity === 'severe'
          );
          if (severeAlerts.length > 0) {
            toast({
              title: `⚠️ ${severeAlerts[0].title}`,
              description: severeAlerts[0].description.substring(0, 100) + '...',
              variant: 'destructive',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Try to use cached data on error
      const cached = localStorage.getItem('farmsmart_cache_weather_data');
      if (cached) {
        try {
          const parsedCached = JSON.parse(cached);
          setWeatherData(parsedCached);
          toast({
            title: 'Using cached weather data',
            description: 'Network error. Showing last known weather.',
          });
        } catch (e) {
          console.error('Error parsing cached data:', e);
        }
      } else {
        toast({
          title: 'Weather Unavailable',
          description: 'Unable to fetch weather data. Please try again later.',
          variant: 'destructive',
        });
      }
    }
  }, [toast, isOnline, saveToCache]);

  const fetchWeatherData = useCallback(async () => {
    try {
      setLoading(true);

      // First, try to get user's stored location from database
      if (user) {
        const { data: userLocation, error: locationError } = await supabase
          .from('user_locations')
          .select('latitude, longitude, city, region, country')
          .eq('user_id', user.id)
          .maybeSingle();

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
          setLoading(false);
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
                
                await supabase.from('user_locations').upsert({
                  user_id: user.id,
                  latitude,
                  longitude,
                  city: geoData.city || '',
                  region: geoData.principalSubdivision || '',
                  country: geoData.countryName || '',
                  updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
              } catch (err) {
                console.error('Error saving location:', err);
              }
            }

            await fetchWeatherForLocation(latitude, longitude);
            setLoading(false);
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
            setLoading(false);
          },
          { timeout: 10000, enableHighAccuracy: true, maximumAge: 300000 }
        );
      } else {
        // Geolocation not available
        setLocationName('New York, USA');
        await fetchWeatherForLocation(40.7128, -74.0060, 'New York, USA');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in fetchWeatherData:', error);
      setLoading(false);
    }
  }, [user, toast, fetchWeatherForLocation]);

  // Manual refresh handler
  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Update location in database for logged-in users
            if (user) {
              try {
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                const geoData = await response.json();
                
                const locationText = [geoData.city, geoData.principalSubdivision, geoData.countryName]
                  .filter(Boolean)
                  .join(', ');
                
                await supabase.from('user_locations').upsert({
                  user_id: user.id,
                  latitude,
                  longitude,
                  city: geoData.city || '',
                  region: geoData.principalSubdivision || '',
                  country: geoData.countryName || '',
                  updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
                
                await fetchWeatherForLocation(latitude, longitude, locationText);
              } catch (err) {
                console.error('Error updating location:', err);
                await fetchWeatherForLocation(latitude, longitude);
              }
            } else {
              await fetchWeatherForLocation(latitude, longitude);
            }
            setRefreshing(false);
          },
          (error) => {
            console.error('Geolocation error:', error);
            toast({
              title: 'Location Error',
              description: 'Unable to get current location.',
              variant: 'destructive',
            });
            setRefreshing(false);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    } catch (error) {
      console.error('Error refreshing:', error);
      setRefreshing(false);
    }
  };

  // Initial fetch - only run once on mount
  useEffect(() => {
    fetchWeatherData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to realtime location changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('weather_location_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_locations',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Location changed, refreshing weather:', payload);
          const newData = payload.new as any;
          if (newData && newData.latitude && newData.longitude) {
            const locationText = [newData.city, newData.region, newData.country]
              .filter(Boolean)
              .join(', ');
            await fetchWeatherForLocation(
              Number(newData.latitude),
              Number(newData.longitude),
              locationText
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchWeatherForLocation]);

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentCoords) {
        fetchWeatherForLocation(currentCoords.lat, currentCoords.lon, locationName);
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentCoords, locationName, fetchWeatherForLocation]);

  if (loading) {
    return (
      <Card className="p-4 bg-gradient-sky border-0 text-white min-h-[180px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            <Cloud className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80" />
          </div>
          <p className="text-sm opacity-90">Fetching weather data...</p>
        </div>
      </Card>
    );
  }

  if (!weatherData) {
    return (
      <Card className="p-4 bg-gradient-sky border-0 text-white">
        <div className="text-center">
          <p>Weather data unavailable</p>
          <button 
            onClick={handleRefresh}
            className="mt-2 text-sm underline opacity-80 hover:opacity-100"
          >
            Try again
          </button>
        </div>
      </Card>
    );
  }

  const CurrentIcon = getWeatherIcon(weatherData.current.main);
  const alerts = weatherData.alerts || [];
  const displayedAlerts = showAllAlerts ? alerts : alerts.slice(0, 2);

  return (
    <div className="space-y-3">
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
              {isFromCache && (
                <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                  <Database className="w-3 h-3" />
                  <span>Cached: {getCacheAge('weather_data')}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefresh}
                disabled={refreshing || !isOnline}
                className="p-1 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <CurrentIcon className="w-8 h-8" />
            </div>
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

          <div className="pt-2 border-t border-white/20">
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {weatherData.forecast.map((day) => {
                const DayIcon = getWeatherIcon(day.condition);
                return (
                  <div key={day.day} className="text-center flex-shrink-0 min-w-[3rem]">
                    <div className="text-xs opacity-90 font-medium">{day.day}</div>
                    <DayIcon className="w-5 h-5 mx-auto my-1" />
                    <div className="text-sm font-semibold">{day.temp}°</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Weather Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Weather Alerts ({alerts.length})
            </h4>
            {alerts.length > 2 && (
              <button
                onClick={() => setShowAllAlerts(!showAllAlerts)}
                className="text-xs text-primary hover:underline"
              >
                {showAllAlerts ? 'Show less' : `Show all (${alerts.length})`}
              </button>
            )}
          </div>
          
          {displayedAlerts.map((alert, index) => {
            const AlertIcon = getAlertIcon(alert.icon);
            return (
              <Alert 
                key={index} 
                className={`${getAlertStyles(alert.severity)} border transition-all`}
              >
                <AlertIcon className="h-4 w-4" />
                <AlertTitle className="text-sm font-semibold">{alert.title}</AlertTitle>
                <AlertDescription className="text-xs opacity-90 mt-1">
                  {alert.description}
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      )}
    </div>
  );
};