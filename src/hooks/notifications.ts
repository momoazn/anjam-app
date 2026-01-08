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

type NotificationMutationAction =
  | "markRead"
  | "markAllRead"
  | "delete"
  | "clearAll"
  | "clearRead";

export function useNotificationMutation(action: NotificationMutationAction) {
  const mutation = useMutation(
    action === "markRead"
      ? api.notifications.markRead
      : action === "markAllRead"
        ? api.notifications.markAllRead
        : action === "delete"
          ? api.notifications.deleteNotification
          : action === "clearAll"
            ? api.notifications.clearAll
            : api.notifications.clearRead,
  ) as unknown as (args: Record<string, unknown>) => Promise<unknown>;

  const mutate = async (id?: string) => {
    if (action === "markRead" || action === "delete") {
      if (!id) return undefined;
      return await mutation({
        notificationId: id as Id<"notifications">,
      });
    }

    return await mutation({});
  };

  return {
    mutate,
    isPending: false,
  };
}
