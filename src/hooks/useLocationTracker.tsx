import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isFieldLocationPinned } from '@/hooks/useActiveLocation';
import { reverseGeocode } from '@/lib/geocode';

interface LocationData {
  lat: number;
  lng: number;
  city?: string;
  region?: string;
  country?: string;
}

export const useLocationTracker = () => {
  const { user } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<{ lat: number; lng: number } | null>(null);

  const fetchLocationDetails = async (latitude: number, longitude: number): Promise<{ city: string; region: string; country: string }> => {
    return await reverseGeocode(latitude, longitude);
  };

  const updateLocationInDatabase = useCallback(async (locationData: LocationData) => {
    if (!user) return;
    // Respect the user's pinned field location — do not overwrite it with GPS.
    if (isFieldLocationPinned()) return;

    try {
      // Check if location has changed significantly (more than 100 meters)
      if (lastUpdateRef.current) {
        const distance = calculateDistance(
          lastUpdateRef.current.lat,
          lastUpdateRef.current.lng,
          locationData.lat,
          locationData.lng
        );
        // Only update if moved more than 50 meters
        if (distance < 0.05) return;
      }

      const { city, region, country } = await fetchLocationDetails(locationData.lat, locationData.lng);

      // Upsert the location - update if exists, insert if not
      const { error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          latitude: locationData.lat,
          longitude: locationData.lng,
          city,
          region,
          country,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating location:', error);
      } else {
        lastUpdateRef.current = { lat: locationData.lat, lng: locationData.lng };
        console.log('Location updated successfully:', { city, region, country });
      }
    } catch (error) {
      console.error('Error in updateLocationInDatabase:', error);
    }
  }, [user]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation || !user) return;

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocationInDatabase({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => console.error('Initial position error:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    // Watch for position changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        updateLocationInDatabase({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => console.error('Watch position error:', error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }, [user, updateLocationInDatabase]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (user) {
      startTracking();
    }
    return () => stopTracking();
  }, [user, startTracking, stopTracking]);

  return { startTracking, stopTracking };
};

// Calculate distance between two points in kilometers (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
