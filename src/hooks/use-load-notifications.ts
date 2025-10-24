import { useAuthUser } from "@/store/auth-store";
import {
  useLoadNotifications as useLoadNotificationsStore,
  useIsLoading,
  useNotificationError,
  useSubscribeToRealtime,
  useUnsubscribeFromRealtime,
} from "@/store/notification-store";
import { useEffect } from "react";

export function useLoadNotifications() {
  const user = useAuthUser();
  const loadNotifications = useLoadNotificationsStore();
  const subscribeToRealtime = useSubscribeToRealtime();
  const unsubscribeFromRealtime = useUnsubscribeFromRealtime();
  const isLoading = useIsLoading();
  const error = useNotificationError();

  // Load notifications when user changes
  useEffect(() => {
    if (user?.id) {
      loadNotifications(user.id);
    }
  }, [user?.id, loadNotifications]);

  // Subscribe to real-time notifications when user is available
  useEffect(() => {
    if (user?.id) {
      subscribeToRealtime(user.id);

      // Cleanup subscription on unmount or user change
      return () => {
        unsubscribeFromRealtime();
      };
    }
  }, [user?.id, subscribeToRealtime, unsubscribeFromRealtime]);

  return {
    isLoading,
    error,
    refetch: () => (user?.id ? loadNotifications(user.id) : Promise.resolve()),
  };
}
