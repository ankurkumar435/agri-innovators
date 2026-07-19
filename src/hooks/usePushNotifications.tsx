import { useState, useCallback } from 'react';

// Web-only stub. Native push notifications were removed with the Capacitor/Android setup.
export const usePushNotifications = () => {
  const [state] = useState({
    token: null as string | null,
    notifications: [] as any[],
    isSupported: false,
    isRegistered: false,
  });

  const registerNotifications = useCallback(async () => false, []);
  const getDeliveredNotifications = useCallback(async () => [], []);
  const clearNotifications = useCallback(async () => {}, []);

  return {
    ...state,
    registerNotifications,
    getDeliveredNotifications,
    clearNotifications,
  };
};
