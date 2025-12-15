import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

import { pb } from "@/lib/pocketbase";
import type { NotificationsRecord } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";

const getNotificationsQueryKey = (userId?: string) => [
  "notifications",
  userId ?? "",
];

export function useNotifications() {
  const user = useAuthUser();
  const userId = user?.id;

  const { refetch, ...query } = useQuery({
    queryKey: getNotificationsQueryKey(userId),
    queryFn: async () => {
      if (!userId) return [];
      return await pb
        .collection("notifications")
        .getFullList<NotificationsRecord>({
          filter: `user = "${userId}"`,
          sort: "-created",
        });
    },
    enabled: !!userId,
  });

  const subscribeToNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      await pb.collection("notifications").subscribe(
        "*",
        () => {
          refetch();
        },
        { filter: `user = "${userId}"` },
      );
    } catch {
      // Silently fail - notifications will still work via polling
    }
  }, [userId, refetch]);

  const unsubscribeFromNotifications = useCallback(() => {
    pb.collection("notifications").unsubscribe("*");
  }, []);

  useEffect(() => {
    subscribeToNotifications();

    return () => {
      unsubscribeFromNotifications();
    };
  }, [subscribeToNotifications, unsubscribeFromNotifications]);

  return query;
}

// Computed values
export function useUnreadCount() {
  const { data: notifications = [] } = useNotifications();
  return notifications.filter((n) => !n.read).length;
}

// Mutations
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: (id: string) =>
      pb.collection("notifications").update(id, { read: true }),
    onSettled: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: getNotificationsQueryKey(user.id),
        });
      }
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: async (userId: string) => {
      const notifications = await pb
        .collection("notifications")
        .getFullList<NotificationsRecord>({
          filter: `user = "${userId}" && read = false`,
        });

      const updatePromises = notifications.map((notification) =>
        pb.collection("notifications").update(notification.id, { read: true }),
      );

      await Promise.all(updatePromises);
    },
    onSettled: (_data, _error, userId) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        queryClient.invalidateQueries({
          queryKey: getNotificationsQueryKey(targetUserId),
        });
      }
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: (id: string) => pb.collection("notifications").delete(id),
    onSettled: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: getNotificationsQueryKey(user.id),
        });
      }
    },
  });
}

export function useClearAll() {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: async (userId: string) => {
      const notifications = await pb
        .collection("notifications")
        .getFullList<NotificationsRecord>({
          filter: `user = "${userId}"`,
        });

      const deletePromises = notifications.map((notification) =>
        pb.collection("notifications").delete(notification.id),
      );

      await Promise.all(deletePromises);
    },
    onSettled: (_data, _error, userId) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        queryClient.invalidateQueries({
          queryKey: getNotificationsQueryKey(targetUserId),
        });
      }
    },
  });
}

export function useClearRead() {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: async (userId: string) => {
      const notifications = await pb
        .collection("notifications")
        .getFullList<NotificationsRecord>({
          filter: `user = "${userId}" && read = true`,
        });

      const deletePromises = notifications.map((notification) =>
        pb.collection("notifications").delete(notification.id),
      );

      await Promise.all(deletePromises);
    },
    onSettled: (_data, _error, userId) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        queryClient.invalidateQueries({
          queryKey: getNotificationsQueryKey(targetUserId),
        });
      }
    },
  });
}
