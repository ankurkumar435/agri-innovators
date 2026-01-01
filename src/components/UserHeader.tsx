import React, { useEffect, useState, useCallback } from 'react';
import { MapPin, Bell, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AuthDropdown } from '@/components/AuthDropdown';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const UserHeader: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [location, setLocation] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchLocation();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchLocation = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data: userLocation, error } = await supabase
        .from('user_locations')
        .select('city, region, country, updated_at')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (userLocation) {
        const locationString = [userLocation.city, userLocation.region, userLocation.country]
          .filter(Boolean)
          .join(', ') || 'Location not set';
        setLocation(locationString);
      } else {
        setLocation(profile?.location || 'Location not set');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setLocation(profile?.location || 'Location not set');
    }
  }, [user, profile]);

  // Subscribe to realtime location updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user_location_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_locations',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchLocation();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchLocation]);

  const handleRefreshLocation = async () => {
    if (!user || isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Fetch location details
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
              const data = await response.json();
              
              // Update location in database
              await supabase
                .from('user_locations')
                .upsert({
                  user_id: user.id,
                  latitude,
                  longitude,
                  city: data.city || '',
                  region: data.principalSubdivision || '',
                  country: data.countryName || '',
                  updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
              
              await fetchLocation();
            } catch (error) {
              console.error('Error updating location:', error);
            }
            
            setIsRefreshing(false);
          },
          (error) => {
            console.error('Geolocation error:', error);
            setIsRefreshing(false);
          },
          { enableHighAccuracy: true }
        );
      }
    } catch (error) {
      console.error('Error refreshing location:', error);
      setIsRefreshing(false);
    }
  };

  const userName = user ? (profile?.farmer_name || user.email?.split('@')[0] || 'User') : 'Guest User';
  const phoneNumber = user ? (profile?.phone || 'No phone') : '+91 98765 43210';
  const displayLocation = user ? (location || 'Location not set') : 'Punjabi Village, Punjab, India';

  return (
    <div className="bg-gradient-nature text-white p-4 rounded-b-3xl shadow-medium">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-white/20">
            <AvatarFallback className="bg-white/20 text-white font-semibold">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <h2 className="font-semibold text-lg">{userName}</h2>
            <p className="text-sm opacity-90">{phoneNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 opacity-80" />
          <AuthDropdown />
        </div>
      </div>
      
      <div className="flex items-center gap-1 mt-3 text-sm opacity-90">
        <MapPin className="w-4 h-4" />
        <span>{displayLocation}</span>
        <button 
          onClick={handleRefreshLocation}
          className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};