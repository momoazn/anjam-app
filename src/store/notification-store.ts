import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { notificationSoundManager } from "@/lib/notification-sounds";
import type { NotificationsRecord } from "@/lib/pocketbase-types";
interface NotificationState {
  notifications: NotificationsRecord[];
  unreadCount: number;
  isTabVisible: boolean;
  queuedNotifications: NotificationsRecord[];
  soundEnabled: boolean;
  soundVolume: number;
  addNotification: (
    notification: Omit<NotificationsRecord, "id" | "timestamp" | "read">,
  ) => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  markAllAsUnread: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  clearRead: () => void;
  setTabVisibility: (visible: boolean) => void;
  processQueuedNotifications: () => void;
  removeOldNotifications: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
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

      markAsRead: (id) => {
        set((state) => {
          const notifications = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          );
          const unreadCount = notifications.filter((n) => !n.read).length;
          return { notifications, unreadCount };
        });
      },

      markAsUnread: (id) => {
        set((state) => {
          const notifications = state.notifications.map((n) =>
            n.id === id ? { ...n, read: false } : n,
          );
          const unreadCount = notifications.filter((n) => !n.read).length;
          return { notifications, unreadCount };
        });
      },

      markAllAsRead: () => {
        set((state) => {
          const notifications = state.notifications.map((n) => ({
            ...n,
            read: true,
          }));
          return { notifications, unreadCount: 0 };
        });
      },

      markAllAsUnread: () => {
        set((state) => {
          const notifications = state.notifications.map((n) => ({
            ...n,
            read: false,
          }));
          const unreadCount = notifications.length;
          return { notifications, unreadCount };
        });
      },

      deleteNotification: (id) => {
        set((state) => {
          const notifications = state.notifications.filter((n) => n.id !== id);
          const unreadCount = notifications.filter((n) => !n.read).length;
          return { notifications, unreadCount };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0, queuedNotifications: [] });
      },

      clearRead: () => {
        set((state) => {
          const notifications = state.notifications.filter((n) => !n.read);
          const unreadCount = notifications.length;
          return { notifications, unreadCount };
        });
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
