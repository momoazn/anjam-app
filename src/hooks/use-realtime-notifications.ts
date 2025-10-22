import { pb } from "@/lib/pocketbase";
import { NotificationsRecord } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";
import { useAddNotification } from "@/store/notification-store";
import type { RecordSubscription, UnsubscribeFunc } from "pocketbase";
import { useEffect, useRef, useCallback } from "react";

export function useRealtimeNotifications() {
  const user = useAuthUser();
  const addNotification = useAddNotification();
  const subscriptionRef = useRef<UnsubscribeFunc | null>(null);

  // Memoize the event handler to prevent infinite loops
  const handleNotificationEvent = useCallback(
    (e: RecordSubscription<NotificationsRecord>) => {
      console.log("Real-time notification event:", e);

      if (e.action === "create" && e.record.user === user?.id) {
        // Add to notification store (this will handle showing toast and sound)
        addNotification(e.record);
      }
    },
    [user?.id, addNotification],
  );

  useEffect(() => {
    if (!user) {
      // Clean up subscription if user logs out
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
      return;
    }

    // Subscribe to notifications collection for the current user
    const subscribeToNotifications = async () => {
      try {
        subscriptionRef.current = await pb
          .collection("notifications")
          .subscribe("*", handleNotificationEvent);

        console.log("Subscribed to real-time notifications");
      } catch (error) {
        console.error("Failed to subscribe to notifications:", error);
      }
    };

    subscribeToNotifications();

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
        console.log("Unsubscribed from real-time notifications");
      }
    };
  }, [user, handleNotificationEvent]);
}
