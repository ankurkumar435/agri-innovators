import { Bell, BellOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Badge } from '@/components/ui/badge';

const NotificationSettings = () => {
  const {
    isSupported,
    isRegistered,
    token,
    notifications,
    registerNotifications,
    clearNotifications,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are only available on the mobile app.
            Install the app on your device to receive alerts.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive alerts about weather, crop conditions, and market prices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Enable Notifications</p>
            <p className="text-xs text-muted-foreground">
              Get real-time farming alerts
            </p>
          </div>
          <Switch
            checked={isRegistered}
            onCheckedChange={(checked) => {
              if (checked) {
                registerNotifications();
              }
            }}
            disabled={isRegistered}
          />
        </div>

        {isRegistered && (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Registered
              </Badge>
              {notifications.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {notifications.length} new
                </Badge>
              )}
            </div>

            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearNotifications}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Notifications
              </Button>
            )}

            {token && (
              <p className="text-xs text-muted-foreground break-all">
                Device Token: {token.substring(0, 20)}...
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
