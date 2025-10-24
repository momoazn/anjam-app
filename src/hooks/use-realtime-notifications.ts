import { useAuthUser } from "@/store/auth-store";
import {
  useSubscribeToRealtime,
  useUnsubscribeFromRealtime,
} from "@/store/notification-store";
import { useEffect } from "react";

export function useRealtimeNotifications() {
  const user = useAuthUser();
  const subscribeToRealtime = useSubscribeToRealtime();
  const unsubscribeFromRealtime = useUnsubscribeFromRealtime();

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    // Subscribe to real-time notifications
    subscribeToRealtime(user.id);

    // Cleanup subscription on unmount or user change
    return () => {
      unsubscribeFromRealtime();
    };
  }, [user?.id, subscribeToRealtime, unsubscribeFromRealtime]);
}
