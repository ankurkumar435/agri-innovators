import React, { useEffect, useState } from 'react';
import { MapPin, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthDropdown } from '@/components/AuthDropdown';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const UserHeader: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
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
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const getUserLocation = async () => {
    if (!user) return 'Punjabi Village, Punjab, India';
    
    try {
      const { data: userLocation } = await supabase
        .from('user_locations')
        .select('city, region, country')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (userLocation) {
        return [userLocation.city, userLocation.region, userLocation.country]
          .filter(Boolean)
          .join(', ') || 'Location not set';
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
    
    return profile?.location || 'Location not set';
  };

  const [location, setLocation] = useState<string>('');

  useEffect(() => {
    if (user) {
      getUserLocation().then(setLocation);
    }
  }, [user, profile]);

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
      </div>
    </div>
  );
};