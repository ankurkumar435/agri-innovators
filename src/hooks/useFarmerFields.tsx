import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FarmerField {
  id: string;
  user_id: string;
  name: string;
  polygon: { lat: number; lng: number }[];
  area_acres: number;
  center_lat: number;
  center_lng: number;
  crop: string | null;
  growth_stage: string | null;
  sowing_date: string | null;
  expected_harvest_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type FarmerFieldInput = Omit<FarmerField, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export const GROWTH_STAGES = [
  'Sowing',
  'Germination',
  'Vegetative',
  'Flowering',
  'Fruiting',
  'Maturity',
  'Harvest',
];

export const COMMON_CROPS = [
  'Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Soybean',
  'Groundnut', 'Mustard', 'Barley', 'Millet', 'Pulses', 'Vegetables',
];

export const useFarmerFields = () => {
  const { user } = useAuth();
  const [fields, setFields] = useState<FarmerField[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFields = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('farmer_fields')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setFields(data as any);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchFields(); }, [fetchFields]);

  const addField = async (input: FarmerFieldInput) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('farmer_fields')
      .insert({ ...input, polygon: input.polygon as any, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    await fetchFields();
    return data as any;
  };

  const updateField = async (id: string, patch: Partial<FarmerFieldInput>) => {
    const { error } = await supabase
      .from('farmer_fields')
      .update({ ...patch, polygon: patch.polygon as any })
      .eq('id', id);
    if (error) throw error;
    await fetchFields();
  };

  const deleteField = async (id: string) => {
    const { error } = await supabase.from('farmer_fields').delete().eq('id', id);
    if (error) throw error;
    await fetchFields();
  };

  return { fields, loading, addField, updateField, deleteField, refetch: fetchFields };
};

// Compute area of polygon in acres using spherical excess formula
export function computePolygonAreaAcres(coords: { lat: number; lng: number }[]): number {
  if (coords.length < 3) return 0;
  const R = 6378137; // Earth radius (m)
  const toRad = (d: number) => (d * Math.PI) / 180;
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];
    area += toRad(p2.lng - p1.lng) * (2 + Math.sin(toRad(p1.lat)) + Math.sin(toRad(p2.lat)));
  }
  area = Math.abs((area * R * R) / 2); // m²
  return area / 4046.8564224; // acres
}

export function computeCentroid(coords: { lat: number; lng: number }[]) {
  const lat = coords.reduce((s, c) => s + c.lat, 0) / coords.length;
  const lng = coords.reduce((s, c) => s + c.lng, 0) / coords.length;
  return { lat, lng };
}
