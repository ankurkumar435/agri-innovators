import { useCallback, useEffect, useState } from 'react';

export interface NotificationPrefs {
  weatherAlerts: boolean;
  marketUpdates: boolean;
  pestWarnings: boolean;
}

const STORAGE_KEY = 'farmsmart.notification_prefs';

const DEFAULTS: NotificationPrefs = {
  weatherAlerts: true,
  marketUpdates: true,
  pestWarnings: true,
};

const read = (): NotificationPrefs => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
};

// Simple in-tab pub/sub so all consumers stay in sync
const listeners = new Set<() => void>();

export const useNotificationPrefs = () => {
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => read());

  useEffect(() => {
    const cb = () => setPrefs(read());
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) cb();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const update = useCallback((patch: Partial<NotificationPrefs>) => {
    const next = { ...read(), ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    listeners.forEach((l) => l());
  }, []);

  return { prefs, update };
};

export const getNotificationPrefs = read;
