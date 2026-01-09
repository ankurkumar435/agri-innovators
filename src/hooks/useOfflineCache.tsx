import { useState, useEffect, useCallback } from 'react';

const CACHE_PREFIX = 'farmsmart_cache_';
const CACHE_TIMESTAMP_PREFIX = 'farmsmart_cache_ts_';
const PENDING_SYNC_KEY = 'farmsmart_pending_sync';

interface CacheOptions {
  expirationMinutes?: number;
}

interface PendingSyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
}

export function useOfflineCache<T>(key: string, options: CacheOptions = {}) {
  const { expirationMinutes = 60 } = options;
  const [cachedData, setCachedData] = useState<T | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // Load cached data on mount
  useEffect(() => {
    const cached = getFromCache<T>(key);
    if (cached) {
      setCachedData(cached);
      setIsFromCache(true);
    }
  }, [key]);

  const saveToCache = useCallback((data: T) => {
    try {
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(data));
      localStorage.setItem(`${CACHE_TIMESTAMP_PREFIX}${key}`, Date.now().toString());
      setCachedData(data);
      setIsFromCache(false);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, [key]);

  const getFromCache = useCallback(<T,>(cacheKey: string): T | null => {
    try {
      const data = localStorage.getItem(`${CACHE_PREFIX}${cacheKey}`);
      const timestamp = localStorage.getItem(`${CACHE_TIMESTAMP_PREFIX}${cacheKey}`);
      
      if (!data || !timestamp) return null;

      const cacheAge = (Date.now() - parseInt(timestamp)) / (1000 * 60);
      if (cacheAge > expirationMinutes) {
        // Cache expired
        localStorage.removeItem(`${CACHE_PREFIX}${cacheKey}`);
        localStorage.removeItem(`${CACHE_TIMESTAMP_PREFIX}${cacheKey}`);
        return null;
      }

      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }, [expirationMinutes]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    localStorage.removeItem(`${CACHE_TIMESTAMP_PREFIX}${key}`);
    setCachedData(null);
  }, [key]);

  return {
    cachedData,
    isFromCache,
    saveToCache,
    getFromCache,
    clearCache
  };
}

// Utility functions for pending sync management
export function addToPendingSync(item: Omit<PendingSyncItem, 'timestamp'>) {
  try {
    const pending = getPendingSync();
    const newItem: PendingSyncItem = {
      ...item,
      timestamp: Date.now()
    };
    pending.push(newItem);
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
  } catch (error) {
    console.error('Error adding to pending sync:', error);
  }
}

export function getPendingSync(): PendingSyncItem[] {
  try {
    const data = localStorage.getItem(PENDING_SYNC_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting pending sync:', error);
    return [];
  }
}

export function removePendingSyncItem(id: string) {
  try {
    const pending = getPendingSync();
    const filtered = pending.filter(item => item.id !== id);
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing pending sync item:', error);
  }
}

export function clearPendingSync() {
  localStorage.removeItem(PENDING_SYNC_KEY);
}

// Get cache age in a human-readable format
export function getCacheAge(key: string): string | null {
  const timestamp = localStorage.getItem(`${CACHE_TIMESTAMP_PREFIX}${key}`);
  if (!timestamp) return null;

  const ageMs = Date.now() - parseInt(timestamp);
  const minutes = Math.floor(ageMs / (1000 * 60));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
