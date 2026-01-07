import { useMutation, useQuery } from "convex/react";

import { authClient } from "@/lib/auth-client";
import { Id, api } from "@/lib/convex";

export function useNotifications() {
  const { data: session } = authClient.useSession();
  const isAuthenticated = Boolean(session?.user);
  const notifications = useQuery(
    api.notifications.listForMe,
    isAuthenticated ? {} : "skip",
  );

  return {
    data: notifications,
    isLoading: notifications === undefined,
    error: null as unknown,
  };
}

export function useUnreadCount() {
  const { data: session } = authClient.useSession();
  const isAuthenticated = Boolean(session?.user);
  const notifications = useQuery(
    api.notifications.listForMe,
    isAuthenticated ? {} : "skip",
  );

  if (!notifications) return 0;
  return notifications.filter((n) => !n.read).length;
}

export function useMarkAsRead() {
  const markRead = useMutation(api.notifications.markRead);

  const mutate = async (id: string) => {
    return await markRead({
      notificationId: id as Id<"notifications">,
    });
  };

  return {
    mutate,
    mutateAsync: mutate,
    isPending: false,
  };
}

export function useMarkAllAsRead() {
  const markAllRead = useMutation(api.notifications.markAllRead);

  const mutate = async () => {
    return await markAllRead({});
  };

  return {
    mutate,
    mutateAsync: mutate,
    isPending: false,
  };
}

export function useDeleteNotification() {
  const deleteMutation = useMutation(api.notifications.deleteNotification);

  const mutate = async (id: string) => {
    return await deleteMutation({
      notificationId: id as Id<"notifications">,
    });
  };

  return {
    mutate,
    mutateAsync: mutate,
    isPending: false,
  };
}

export function useClearAll() {
  const clearAll = useMutation(api.notifications.clearAll);

  const mutate = async () => {
    return await clearAll({});
  };

  return {
    mutate,
    mutateAsync: mutate,
    isPending: false,
  };
}

export function useClearRead() {
  const clearRead = useMutation(api.notifications.clearRead);

  const mutate = async () => {
    return await clearRead({});
  };

  return {
    mutate,
    mutateAsync: mutate,
    isPending: false,
  };
}
