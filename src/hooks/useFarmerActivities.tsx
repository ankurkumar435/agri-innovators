import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface FarmerActivity {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: string | null;
  scheduled_time: string;
  scheduled_date: string;
  status: 'pending' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CreateActivityInput {
  title: string;
  description?: string;
  location?: string;
  scheduled_time: string;
  scheduled_date?: string;
  status?: 'pending' | 'active' | 'completed';
}

export function useFarmerActivities() {
  const [activities, setActivities] = useState<FarmerActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchActivities = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('farmer_activities')
        .select('*')
        .eq('scheduled_date', today)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setActivities((data as FarmerActivity[]) || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (input: CreateActivityInput) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('farmer_activities')
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description || null,
          location: input.location || null,
          scheduled_time: input.scheduled_time,
          scheduled_date: input.scheduled_date || new Date().toISOString().split('T')[0],
          status: input.status || 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      setActivities(prev => [...prev, data as FarmerActivity].sort((a, b) => 
        a.scheduled_time.localeCompare(b.scheduled_time)
      ));
      
      toast({ title: 'Activity added successfully' });
      return data as FarmerActivity;
    } catch (error) {
      console.error('Error creating activity:', error);
      toast({ title: 'Failed to add activity', variant: 'destructive' });
      return null;
    }
  };

  const updateActivity = async (id: string, updates: Partial<CreateActivityInput>) => {
    try {
      const { data, error } = await supabase
        .from('farmer_activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setActivities(prev => 
        prev.map(a => a.id === id ? (data as FarmerActivity) : a)
      );
      
      toast({ title: 'Activity updated' });
      return data as FarmerActivity;
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({ title: 'Failed to update activity', variant: 'destructive' });
      return null;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('farmer_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setActivities(prev => prev.filter(a => a.id !== id));
      toast({ title: 'Activity deleted' });
      return true;
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({ title: 'Failed to delete activity', variant: 'destructive' });
      return false;
    }
  };

  const toggleStatus = async (id: string) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;

    const statusOrder: ('pending' | 'active' | 'completed')[] = ['pending', 'active', 'completed'];
    const currentIndex = statusOrder.indexOf(activity.status);
    const nextStatus = statusOrder[(currentIndex + 1) % 3];

    return updateActivity(id, { status: nextStatus });
  };

  useEffect(() => {
    fetchActivities();
  }, [user]);

  return {
    activities,
    loading,
    createActivity,
    updateActivity,
    deleteActivity,
    toggleStatus,
    refetch: fetchActivities
  };
}
