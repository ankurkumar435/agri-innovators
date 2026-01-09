import { WifiOff, RefreshCw, Cloud, CheckCircle } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { getPendingSync } from '@/hooks/useOfflineCache';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const updatePendingCount = () => {
      const pending = getPendingSync();
      setPendingCount(pending.length);
    };

    updatePendingCount();
    
    // Listen for storage changes
    const handleStorage = () => updatePendingCount();
    window.addEventListener('storage', handleStorage);
    
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowBackOnline(true);
      const timer = setTimeout(() => setShowBackOnline(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showBackOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className={cn(
        "mx-4 mt-2 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 pointer-events-auto",
        !isOnline 
          ? "bg-amber-500/90 text-amber-950 backdrop-blur-sm" 
          : showBackOnline 
            ? "bg-green-500/90 text-green-950 backdrop-blur-sm"
            : "bg-blue-500/90 text-blue-950 backdrop-blur-sm"
      )}>
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span>You're offline - Using cached data</span>
            {pendingCount > 0 && (
              <span className="ml-2 bg-amber-800/30 px-2 py-0.5 rounded-full text-xs">
                {pendingCount} pending
              </span>
            )}
          </>
        ) : showBackOnline ? (
          <>
            <CheckCircle className="h-4 w-4" />
            <span>Back online!</span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Syncing {pendingCount} items...</span>
          </>
        ) : null}
      </div>
    </div>
  );
}
