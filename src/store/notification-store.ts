import { toast } from "sonner";
import { create } from "zustand";

import { notificationService } from "@/lib/notification-service";
import type { NotificationsRecord } from "@/lib/pocketbase-types";

interface NotificationState {
  notifications: NotificationsRecord[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  subscriptionId: string | null;
  isSubscribed: boolean;
  // Actions
  loadNotifications: (userId: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: (userId: string) => Promise<void>;
  clearRead: (userId: string) => Promise<void>;
  setNotifications: (notifications: NotificationsRecord[]) => void;
  subscribeToRealtime: (userId: string) => Promise<void>;
  unsubscribeFromRealtime: () => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  subscriptionId: null,
  isSubscribed: false,

  loadNotifications: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await notificationService.fetchNotifications({
        user: userId,
      });
      const unreadCount = notifications.filter((n) => !n.read).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load notifications",
        isLoading: false,
      });
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => {
        const notifications = state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        );
        const unreadCount = notifications.filter((n) => !n.read).length;
        return { notifications, unreadCount };
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllAsRead: async (userId) => {
    try {
      await notificationService.markAllAsRead(userId);
      set((state) => {
        const notifications = state.notifications.map((n) => ({
          ...n,
          read: true,
        }));
        return { notifications, unreadCount: 0 };
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationService.deleteNotification(id);
      set((state) => {
        const notifications = state.notifications.filter((n) => n.id !== id);
        const unreadCount = notifications.filter((n) => !n.read).length;
        return { notifications, unreadCount };
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  },

  clearAll: async (userId) => {
    try {
      await notificationService.clearAll(userId);
      set({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    }
  },

  clearRead: async (userId) => {
    try {
      await notificationService.clearRead(userId);
      set((state) => {
        const notifications = state.notifications.filter((n) => !n.read);
        const unreadCount = notifications.length;
        return { notifications, unreadCount };
      });
    } catch (error) {
      console.error("Failed to clear read notifications:", error);
    }
  },

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ notifications, unreadCount });
  },

  subscribeToRealtime: async (userId) => {
    try {
      // Prevent multiple subscriptions
      const { isSubscribed } = get();
      if (isSubscribed) {
        return;
      }

      // Unsubscribe from any existing subscription first
      const { subscriptionId: existingId } = get();
      if (existingId) {
        notificationService.unsubscribeFromNotifications(existingId);
      }

      const subscriptionId = await notificationService.subscribeToNotifications(
        userId,
        (e) => {
          if (e.action === "create") {
            // Show toast for new notification
            toast(e.record.title, {
              description: e.record.message,
              duration: 5000,
            });

            // Add to notifications
            set((state) => {
              const newNotifications = [e.record, ...state.notifications];
              const unreadCount = newNotifications.filter(
                (n) => !n.read,
              ).length;
              return {
                notifications: newNotifications.slice(0, 100), // Keep only last 100
                unreadCount,
              };
            });
          } else if (e.action === "update") {
            // Update existing notification
            set((state) => {
              const notifications = state.notifications.map((n) =>
                n.id === e.record.id ? e.record : n,
              );
              const unreadCount = notifications.filter((n) => !n.read).length;
              return { notifications, unreadCount };
            });
          } else if (e.action === "delete") {
            // Remove deleted notification
            set((state) => {
              const notifications = state.notifications.filter(
                (n) => n.id !== e.record.id,
              );
              const unreadCount = notifications.filter((n) => !n.read).length;
              return { notifications, unreadCount };
            });
          }
        },
      );

      set({ subscriptionId, isSubscribed: true });
    } catch (error) {
      console.error("Failed to subscribe to real-time notifications:", error);
    }
  },

  unsubscribeFromRealtime: () => {
    const { subscriptionId } = get();
    if (subscriptionId) {
      notificationService.unsubscribeFromNotifications(subscriptionId);
      set({ subscriptionId: null, isSubscribed: false });
    }
  },
}));

// Optimized selectors to prevent infinite loops
export const useNotifications = () =>
  useNotificationStore((state) => state.notifications);

export const useUnreadCount = () =>
  useNotificationStore((state) => state.unreadCount);

// Individual action selectors to prevent object recreation
export const useMarkAsRead = () =>
  useNotificationStore((state) => state.markAsRead);

export const useMarkAllAsRead = () =>
  useNotificationStore((state) => state.markAllAsRead);

export const useDeleteNotification = () =>
  useNotificationStore((state) => state.deleteNotification);

export const useClearAll = () =>
  useNotificationStore((state) => state.clearAll);

export const useClearRead = () =>
  useNotificationStore((state) => state.clearRead);

export const useSetNotifications = () =>
  useNotificationStore((state) => state.setNotifications);

export const useLoadNotifications = () =>
  useNotificationStore((state) => state.loadNotifications);

export const useSubscribeToRealtime = () =>
  useNotificationStore((state) => state.subscribeToRealtime);

export const useUnsubscribeFromRealtime = () =>
  useNotificationStore((state) => state.unsubscribeFromRealtime);

export const useIsLoading = () =>
  useNotificationStore((state) => state.isLoading);

export const useNotificationError = () =>
  useNotificationStore((state) => state.error);

// Legacy selector for backward compatibility (use sparingly)
export const useNotificationActions = () => {
  const store = useNotificationStore();
  return {
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    clearAll: store.clearAll,
  };
};
