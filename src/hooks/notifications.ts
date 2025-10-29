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

  const subscribeToNotifications = useCallback(() => {
    if (!userId) return;
    pb.collection("notifications").subscribe(
      "*",
      () => {
        refetch();
      },
      { filter: `user = "${userId}"` },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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
    onMutate: async (id: string) => {
      // Optimistically update cache to mark as read
      if (!user?.id) return;
      const key = getNotificationsQueryKey(user.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationsRecord[]>(key);
      queryClient.setQueryData<NotificationsRecord[]>(key, (old = []) =>
        old.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      return { previous };
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: getNotificationsQueryKey(user.id),
        });
      }
    },
    onError: (_err, _id, ctx) => {
      if (user?.id && ctx?.previous) {
        queryClient.setQueryData(getNotificationsQueryKey(user.id), ctx.previous);
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
    onMutate: async (userId: string) => {
      // Optimistically mark all as read
      const key = getNotificationsQueryKey(userId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationsRecord[]>(key);
      queryClient.setQueryData<NotificationsRecord[]>(key, (old = []) =>
        old.map((n) => ({ ...n, read: true })),
      );
      return { previous };
    },
    onError: (_err, userId, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(getNotificationsQueryKey(userId), ctx.previous);
      }
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: getNotificationsQueryKey(user.id),
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
    onSuccess: () => {
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
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: getNotificationsQueryKey(user.id),
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
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: getNotificationsQueryKey(user.id),
        });
      }
    },
  });
}
