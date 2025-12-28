import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useAuthUser } from "@/store/auth-store";
import { createMutation } from "./use-mutation-factory";
import { queryKeys } from "./query-keys";
import {
  fetchUserNotifications,
  markAsRead,
  markMultipleAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  fetchUnreadNotifications,
  fetchAllNotifications,
  fetchReadNotifications,
} from "@/lib/notifications-utils";

export function useNotifications() {
  const user = useAuthUser();
  const userId = user?.id;

  const { refetch, ...query } = useQuery({
    queryKey: queryKeys.notificationsUnreadCount(userId),
    queryFn: async () => {
      if (!userId) return [];
      return fetchUserNotifications(userId);
    },
    enabled: !!userId,
  });

  const subscribe = useCallback(async () => {
    if (!userId) return;
    await subscribeToNotifications(userId, () => {
      refetch();
    });
  }, [userId, refetch]);

  const unsubscribe = useCallback(() => {
    unsubscribeFromNotifications();
  }, []);

  useEffect(() => {
    subscribe();

    return () => {
      unsubscribe();
    };
  }, [subscribe, unsubscribe]);

  return query;
}

export function useUnreadCount() {
  const user = useAuthUser();
  const userId = user?.id;

  const { data: notifications = [] } = useQuery({
    queryKey: queryKeys.notificationsUnreadCount(userId),
    queryFn: async () => {
      if (!userId) return [];
      return fetchUnreadNotifications(userId);
    },
    enabled: !!userId,
  });

  return notifications.filter((n) => !n.read).length;
}

export function useMarkAsRead() {
  const user = useAuthUser();

  const mutation = createMutation<void, Error, string>(markAsRead, (client) => {
    if (user?.id) {
      client.invalidateQueries({
        queryKey: queryKeys.notificationsUnreadCount(user.id),
      });
    }
  });

  return mutation();
}

export function useMarkAllAsRead() {
  const user = useAuthUser();

  const mutation = createMutation<string, Error, string>(
    async (userId) => {
      const notifications = await fetchUnreadNotifications(userId);
      await markMultipleAsRead(notifications);
      return userId;
    },
    (client, _data, userId) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        client.invalidateQueries({
          queryKey: queryKeys.notificationsUnreadCount(targetUserId),
        });
      }
    },
  );

  return mutation();
}

export function useDeleteNotification() {
  const user = useAuthUser();

  const mutation = createMutation<void, Error, string>(
    deleteNotification,
    (client) => {
      if (user?.id) {
        client.invalidateQueries({
          queryKey: queryKeys.notificationsUnreadCount(user.id),
        });
      }
    },
  );

  return mutation();
}

export function useClearAll() {
  const user = useAuthUser();

  const mutation = createMutation<string, Error, string>(
    async (userId) => {
      const notifications = await fetchAllNotifications(userId);
      await deleteMultipleNotifications(notifications);
      return userId;
    },
    (client, _data, userId) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        client.invalidateQueries({
          queryKey: queryKeys.notificationsUnreadCount(targetUserId),
        });
      }
    },
  );

  return mutation();
}

export function useClearRead() {
  const user = useAuthUser();

  const mutation = createMutation<string, Error, string>(
    async (userId) => {
      const notifications = await fetchReadNotifications(userId);
      await deleteMultipleNotifications(notifications);
      return userId;
    },
    (client, _data, userId) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        client.invalidateQueries({
          queryKey: queryKeys.notificationsUnreadCount(targetUserId),
        });
      }
    },
  );

  return mutation();
}
