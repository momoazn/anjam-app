import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { notificationSoundManager } from "@/lib/notification-sounds";
import { notificationService } from "@/lib/notification-service";
import type { NotificationsRecord } from "@/lib/pocketbase-types";
interface NotificationState {
  notifications: NotificationsRecord[];
  unreadCount: number;
  isTabVisible: boolean;
  queuedNotifications: NotificationsRecord[];
  soundEnabled: boolean;
  soundVolume: number;
  isLoading: boolean;
  error: string | null;
  subscriptionId: string | null;
  // Actions
  loadNotifications: (userId: string) => Promise<void>;
  addNotification: (
    notification: Omit<NotificationsRecord, "id" | "timestamp" | "read">,
  ) => void;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  markAllAsUnread: (userId: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: (userId: string) => Promise<void>;
  clearRead: (userId: string) => Promise<void>;
  setTabVisibility: (visible: boolean) => void;
  processQueuedNotifications: () => void;
  removeOldNotifications: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setNotifications: (notifications: NotificationsRecord[]) => void;
  subscribeToRealtime: (userId: string) => Promise<void>;
  unsubscribeFromRealtime: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isTabVisible: true,
      queuedNotifications: [],
      soundEnabled: false,
      soundVolume: 0.5,
      isLoading: false,
      error: null,
      subscriptionId: null,

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

      addNotification: (notificationData) => {
        const notification: NotificationsRecord = {
          ...notificationData,
          id: crypto.randomUUID(),
          created: new Date().toISOString() || "",
          read: false,
        };

        set((state) => {
          const { isTabVisible, queuedNotifications, soundEnabled } = state;

          if (isTabVisible) {
            // Show toast immediately when tab is visible
            toast(notification.title, {
              description: notification.message,
              duration: 5000,
            });

            // Play sound if enabled
            if (soundEnabled) {
              notificationSoundManager.playSound("info");
            }

            const newNotifications = [notification, ...state.notifications];
            const unreadCount = newNotifications.filter((n) => !n.read).length;
            return {
              notifications: newNotifications.slice(0, 100), // Keep only last 100
              unreadCount,
            };
          } else {
            return {
              queuedNotifications: [...queuedNotifications, notification],
            };
          }
        });
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

      markAsUnread: async (id) => {
        try {
          await notificationService.markAsUnread(id);
          set((state) => {
            const notifications = state.notifications.map((n) =>
              n.id === id ? { ...n, read: false } : n,
            );
            const unreadCount = notifications.filter((n) => !n.read).length;
            return { notifications, unreadCount };
          });
        } catch (error) {
          console.error("Failed to mark notification as unread:", error);
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

      markAllAsUnread: async (userId) => {
        try {
          await notificationService.markAllAsUnread(userId);
          set((state) => {
            const notifications = state.notifications.map((n) => ({
              ...n,
              read: false,
            }));
            const unreadCount = notifications.length;
            return { notifications, unreadCount };
          });
        } catch (error) {
          console.error("Failed to mark all notifications as unread:", error);
        }
      },

      deleteNotification: async (id) => {
        try {
          await notificationService.deleteNotification(id);
          set((state) => {
            const notifications = state.notifications.filter(
              (n) => n.id !== id,
            );
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
          set({ notifications: [], unreadCount: 0, queuedNotifications: [] });
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

      setTabVisibility: (visible) => {
        set({ isTabVisible: visible });
        if (visible) {
          get().processQueuedNotifications();
        }
      },

      processQueuedNotifications: () => {
        const { queuedNotifications, soundEnabled } = get();
        if (queuedNotifications.length === 0) return;

        // Show toasts for queued notifications
        queuedNotifications.forEach((notification) => {
          toast(notification.title, {
            description: notification.message,
            duration: 5000,
          });

          // Play sound for each queued notification if enabled
          if (soundEnabled) {
            notificationSoundManager.playSound("info");
          }
        });

        set((state) => {
          const newNotifications = [
            ...queuedNotifications,
            ...state.notifications,
          ];
          const unreadCount = newNotifications.filter((n) => !n.read).length;
          return {
            notifications: newNotifications.slice(0, 100),
            queuedNotifications: [],
            unreadCount,
          };
        });
      },

      removeOldNotifications: () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        set((state) => {
          const notifications = state.notifications.filter(
            (n) => new Date(n.created || "") > sevenDaysAgo,
          );
          const unreadCount = notifications.filter((n) => !n.read).length;
          return { notifications, unreadCount };
        });
      },

      setSoundEnabled: (enabled) => {
        set({ soundEnabled: enabled });
        notificationSoundManager.setEnabled(enabled);
      },

      setSoundVolume: (volume) => {
        set({ soundVolume: Math.max(0, Math.min(1, volume)) });
        notificationSoundManager.setVolume(volume);
      },

      setNotifications: (notifications) => {
        const unreadCount = notifications.filter((n) => !n.read).length;
        set({ notifications, unreadCount });
      },

      subscribeToRealtime: async (userId) => {
        try {
          const subscriptionId =
            await notificationService.subscribeToNotifications(userId, (e) => {
              if (e.action === "create") {
                // Add new notification to store
                get().addNotification(e.record);
              } else if (e.action === "update") {
                // Update existing notification
                set((state) => {
                  const notifications = state.notifications.map((n) =>
                    n.id === e.record.id ? e.record : n,
                  );
                  const unreadCount = notifications.filter(
                    (n) => !n.read,
                  ).length;
                  return { notifications, unreadCount };
                });
              } else if (e.action === "delete") {
                // Remove deleted notification
                set((state) => {
                  const notifications = state.notifications.filter(
                    (n) => n.id !== e.record.id,
                  );
                  const unreadCount = notifications.filter(
                    (n) => !n.read,
                  ).length;
                  return { notifications, unreadCount };
                });
              }
            });

          set({ subscriptionId });
        } catch (error) {
          console.error(
            "Failed to subscribe to real-time notifications:",
            error,
          );
        }
      },

      unsubscribeFromRealtime: () => {
        const { subscriptionId } = get();
        if (subscriptionId) {
          notificationService.unsubscribeFromNotifications(subscriptionId);
          set({ subscriptionId: null });
        }
      },
    }),
    {
      name: "notification-storage",
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        queuedNotifications: state.queuedNotifications,
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
      }),
    },
  ),
);

// Optimized selectors to prevent infinite loops
export const useNotifications = () =>
  useNotificationStore((state) => state.notifications);

export const useUnreadCount = () =>
  useNotificationStore((state) => state.unreadCount);

export const useSoundEnabled = () =>
  useNotificationStore((state) => state.soundEnabled);

export const useSoundVolume = () =>
  useNotificationStore((state) => state.soundVolume);

// Individual action selectors to prevent object recreation
export const useAddNotification = () =>
  useNotificationStore((state) => state.addNotification);

export const useMarkAsRead = () =>
  useNotificationStore((state) => state.markAsRead);

export const useMarkAsUnread = () =>
  useNotificationStore((state) => state.markAsUnread);

export const useMarkAllAsRead = () =>
  useNotificationStore((state) => state.markAllAsRead);

export const useMarkAllAsUnread = () =>
  useNotificationStore((state) => state.markAllAsUnread);

export const useDeleteNotification = () =>
  useNotificationStore((state) => state.deleteNotification);

export const useClearAll = () =>
  useNotificationStore((state) => state.clearAll);

export const useClearRead = () =>
  useNotificationStore((state) => state.clearRead);

export const useSetTabVisibility = () =>
  useNotificationStore((state) => state.setTabVisibility);

export const useRemoveOldNotifications = () =>
  useNotificationStore((state) => state.removeOldNotifications);

export const useSetSoundEnabled = () =>
  useNotificationStore((state) => state.setSoundEnabled);

export const useSetSoundVolume = () =>
  useNotificationStore((state) => state.setSoundVolume);

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
    addNotification: store.addNotification,
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    clearAll: store.clearAll,
    setTabVisibility: store.setTabVisibility,
    removeOldNotifications: store.removeOldNotifications,
    setSoundEnabled: store.setSoundEnabled,
    setSoundVolume: store.setSoundVolume,
  };
};
