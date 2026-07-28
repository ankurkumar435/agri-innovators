import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FarmerField } from '@/hooks/useFarmerFields';
import { reverseGeocode } from '@/lib/geocode';

const KEY = 'active_field_id';

// Emits when the pinned field changes so listeners in the same tab react instantly.
const CHANGE_EVENT = 'active-location-changed';

export const useActiveLocation = () => {
  const { user } = useAuth();
  const [activeFieldId, setActiveFieldId] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem(KEY) : null
  );

  useEffect(() => {
    const handler = () => setActiveFieldId(localStorage.getItem(KEY));
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const pinToField = useCallback(async (field: FarmerField) => {
    if (!user) return;
    localStorage.setItem(KEY, field.id);
    window.dispatchEvent(new Event(CHANGE_EVENT));

    // Reverse-geocode the field centroid for a friendly city label.
    let city = '', region = '', country = '';
    try {
      const d = await reverseGeocode(field.center_lat, field.center_lng);
      city = d.city;
      region = d.region;
      country = d.country;
    } catch { /* ignore */ }

    await supabase.from('user_locations').upsert({
      user_id: user.id,
      latitude: field.center_lat,
      longitude: field.center_lng,
      city: city || field.name,
      region,
      country,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }, [user]);

  const clearPin = useCallback(() => {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { activeFieldId, pinToField, clearPin, isPinned: !!activeFieldId };
};

export const isFieldLocationPinned = () =>
  typeof window !== 'undefined' && !!localStorage.getItem(KEY);
