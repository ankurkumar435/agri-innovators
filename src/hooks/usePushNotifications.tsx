import { useEffect, useState, useCallback } from 'react';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationState {
  token: string | null;
  notifications: PushNotificationSchema[];
  isSupported: boolean;
  isRegistered: boolean;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    token: null,
    notifications: [],
    isSupported: Capacitor.isNativePlatform(),
    isRegistered: false,
  });
  const { toast } = useToast();

  const registerNotifications = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications are only available on native platforms');
      return false;
    }

    try {
      // Request permission
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        toast({
          title: 'Permission Denied',
          description: 'Push notification permission was denied',
          variant: 'destructive',
        });
        return false;
      }

      // Register with the push notification service
      await PushNotifications.register();
      return true;
    } catch (error) {
      console.error('Error registering push notifications:', error);
      toast({
        title: 'Registration Failed',
        description: 'Failed to register for push notifications',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const addListeners = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;

    // On success, we should be able to receive notifications
    await PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token:', token.value);
      setState(prev => ({ ...prev, token: token.value, isRegistered: true }));
      
      // Store token for later use (e.g., send to backend)
      localStorage.setItem('push_notification_token', token.value);
      
      toast({
        title: 'Notifications Enabled',
        description: 'You will receive farming alerts and updates',
      });
    });

    // Some issue with our setup and target
    await PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error:', error);
      toast({
        title: 'Registration Error',
        description: 'Failed to register for notifications',
        variant: 'destructive',
      });
    });

    // Show us the notification payload if the app is open on our device
    await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received:', notification);
      setState(prev => ({
        ...prev,
        notifications: [...prev.notifications, notification],
      }));

      // Show in-app toast for received notifications
      toast({
        title: notification.title || 'New Notification',
        description: notification.body || '',
      });
    });

    // Method called when tapping on a notification
    await PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Push notification action performed:', action);
      
      // Handle notification tap - navigate or perform action based on data
      const data = action.notification.data;
      if (data?.route) {
        // Navigate to specific route if provided
        window.location.href = data.route;
      }
    });
  }, [toast]);

  const removeListeners = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    await PushNotifications.removeAllListeners();
  }, []);

  const getDeliveredNotifications = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return [];
    
    const result = await PushNotifications.getDeliveredNotifications();
    return result.notifications;
  }, []);

  const clearNotifications = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    await PushNotifications.removeAllDeliveredNotifications();
    setState(prev => ({ ...prev, notifications: [] }));
  }, []);

  useEffect(() => {
    addListeners();
    
    // Check if already registered
    const storedToken = localStorage.getItem('push_notification_token');
    if (storedToken) {
      setState(prev => ({ ...prev, token: storedToken, isRegistered: true }));
    }

    return () => {
      removeListeners();
    };
  }, [addListeners, removeListeners]);

  return {
    ...state,
    registerNotifications,
    getDeliveredNotifications,
    clearNotifications,
  };
};
