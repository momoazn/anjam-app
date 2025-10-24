import { useEffect, useRef } from "react";
import { useNotificationStore } from "@/store/notification-store";

export function useTabVisibility() {
  const setTabVisibility = useNotificationStore(
    (state) => state.setTabVisibility,
  );
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const originalTitle = useRef(document.title);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setTabVisibility(isVisible);

      // Update page title based on visibility and unread count
      if (!isVisible && unreadCount > 0) {
        document.title = `(${unreadCount}) ${originalTitle.current}`;
      } else {
        document.title = originalTitle.current;
      }
    };

    // Set initial state
    handleVisibilityChange();

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Restore original title on cleanup
      document.title = originalTitle.current;
    };
  }, [setTabVisibility, unreadCount]);
}
