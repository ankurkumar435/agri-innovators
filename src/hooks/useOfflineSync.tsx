import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOnlineStatus } from './useOnlineStatus';
import { getPendingSync, removePendingSyncItem, clearPendingSync } from './useOfflineCache';
import { useToast } from '@/hooks/use-toast';

export function useOfflineSync() {
  const { isOnline } = useOnlineStatus();
  const { toast } = useToast();

  const syncPendingItems = useCallback(async () => {
    const pendingItems = getPendingSync();
    
    if (pendingItems.length === 0) return;

    console.log('Syncing', pendingItems.length, 'pending items...');
    
    let successCount = 0;
    let errorCount = 0;

    for (const item of pendingItems) {
      try {
        let result;
        
        switch (item.type) {
          case 'create':
            result = await supabase
              .from(item.table as any)
              .insert(item.data);
            break;
          case 'update':
            result = await supabase
              .from(item.table as any)
              .update(item.data)
              .eq('id', item.id);
            break;
          case 'delete':
            result = await supabase
              .from(item.table as any)
              .delete()
              .eq('id', item.id);
            break;
        }

        if (result?.error) {
          console.error('Sync error for item:', item.id, result.error);
          errorCount++;
        } else {
          removePendingSyncItem(item.id);
          successCount++;
        }
      } catch (error) {
        console.error('Failed to sync item:', item.id, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast({
        title: 'Data synced',
        description: `${successCount} item${successCount > 1 ? 's' : ''} synced successfully`,
      });
    }

    if (errorCount > 0) {
      toast({
        title: 'Sync issues',
        description: `${errorCount} item${errorCount > 1 ? 's' : ''} failed to sync. Will retry later.`,
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (isOnline) {
      // Sync when coming back online
      const handleBackOnline = () => {
        setTimeout(syncPendingItems, 1000); // Small delay to ensure connection is stable
      };

      window.addEventListener('app:back-online', handleBackOnline);
      
      // Also try to sync on mount if online
      syncPendingItems();

      return () => {
        window.removeEventListener('app:back-online', handleBackOnline);
      };
    }
  }, [isOnline, syncPendingItems]);

  return { syncPendingItems };
}
