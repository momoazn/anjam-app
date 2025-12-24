import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

import { pb } from "@/lib/pocketbase";
import type { NotificationsRecord } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";
import { queryKeys } from "./query-keys";
import { createMutation } from "./use-mutation-factory";

const getNotificationsQueryKey = (userId?: string) =>
  userId ? queryKeys.notifications.byUser(userId) : queryKeys.notifications.all;

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
  const user = useAuthUser();

  const mutation = createMutation<unknown, Error, string>(
    (id) => pb.collection("notifications").update(id, { read: true }),
    (client) => {
      if (user?.id) {
        client.invalidateQueries({
          queryKey: getNotificationsQueryKey(user.id),
        });
      }
    },
  );

  return mutation();
}

export function useMarkAllAsRead() {
  const user = useAuthUser();

  const mutation = createMutation<void, Error, string>(
    async (userId: string) => {
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
    (client, _data, userId) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        client.invalidateQueries({
          queryKey: getNotificationsQueryKey(targetUserId),
        });
      }
    },
  );

  return mutation();
}

export function useDeleteNotification() {
  const user = useAuthUser();

  const mutation = createMutation<void, Error, string>(
    async (id) => {
      await pb.collection("notifications").delete(id);
    },
    (client) => {
      if (user?.id) {
        client.invalidateQueries({
          queryKey: getNotificationsQueryKey(user.id),
        });
      }
    },
  );

  return mutation();
}

export function useClearAll() {
  const user = useAuthUser();

  const mutation = createMutation<void, Error, string>(
    async (userId: string) => {
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
    (client, _data, userId) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        client.invalidateQueries({
          queryKey: getNotificationsQueryKey(targetUserId),
        });
      }
    },
  );

  return mutation();
}

export function useClearRead() {
  const user = useAuthUser();

  const mutation = createMutation<void, Error, string>(
    async (userId: string) => {
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
    (client, _data, userId) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        client.invalidateQueries({
          queryKey: getNotificationsQueryKey(targetUserId),
        });
      }
    },
  );

  return mutation();
}
