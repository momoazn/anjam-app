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
    error: null,
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

type NotificationMutationAction =
  | "markRead"
  | "markAllRead"
  | "delete"
  | "clearAll"
  | "clearRead";

export function useNotificationMutation(action: NotificationMutationAction) {
  const markReadMutation = useMutation(api.notifications.markRead);
  const markAllReadMutation = useMutation(api.notifications.markAllRead);
  const deleteMutation = useMutation(api.notifications.deleteNotification);
  const clearAllMutation = useMutation(api.notifications.clearAll);
  const clearReadMutation = useMutation(api.notifications.clearRead);

  const mutate = async (id?: string) => {
    switch (action) {
      case "markRead":
        if (!id) return undefined;
        return await markReadMutation({
          notificationId: id as Id<"notifications">,
        });
      case "markAllRead":
        return await markAllReadMutation({});
      case "delete":
        if (!id) return undefined;
        return await deleteMutation({
          notificationId: id as Id<"notifications">,
        });
      case "clearAll":
        return await clearAllMutation({});
      case "clearRead":
        return await clearReadMutation({});
    }
  };

  return {
    mutate,
    isPending: false,
  };
}
