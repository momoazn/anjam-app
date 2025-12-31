import { queryKeys } from "@/hooks/query-keys";
import { pb } from "@/lib/pocketbase";
import type { NotificationsRecord } from "@/lib/pocketbase-types";

export function getNotificationsQueryKey(userId?: string) {
  return userId
    ? queryKeys.notifications.byUser(userId)
    : queryKeys.notifications.all;
}

export async function fetchUserNotifications(
  userId: string,
): Promise<NotificationsRecord[]> {
  return await pb.collection("notifications").getFullList<NotificationsRecord>({
    filter: `user = "${userId}"`,
    sort: "-created",
  });
}

export async function fetchUnreadNotifications(
  userId: string,
): Promise<NotificationsRecord[]> {
  return await pb.collection("notifications").getFullList<NotificationsRecord>({
    filter: `user = "${userId}" && read = false`,
    sort: "-created",
  });
}

export async function fetchAllNotifications(
  userId: string,
): Promise<NotificationsRecord[]> {
  return await pb.collection("notifications").getFullList<NotificationsRecord>({
    filter: `user = "${userId}"`,
    sort: "-created",
  });
}

export async function fetchReadNotifications(
  userId: string,
): Promise<NotificationsRecord[]> {
  return await pb.collection("notifications").getFullList<NotificationsRecord>({
    filter: `user = "${userId}" && read = true`,
    sort: "-created",
  });
}

export async function markAsRead(notificationId: string): Promise<void> {
  await pb.collection("notifications").update(notificationId, { read: true });
}

export async function markMultipleAsRead(
  notifications: NotificationsRecord[],
): Promise<void> {
  const updatePromises = notifications.map((notification) =>
    pb.collection("notifications").update(notification.id, { read: true }),
  );
  await Promise.all(updatePromises);
}

export async function deleteNotification(
  notificationId: string,
): Promise<void> {
  await pb.collection("notifications").delete(notificationId);
}

export async function deleteMultipleNotifications(
  notifications: NotificationsRecord[],
): Promise<void> {
  const deletePromises = notifications.map((notification) =>
    pb.collection("notifications").delete(notification.id),
  );
  await Promise.all(deletePromises);
}

export async function subscribeToNotifications(
  userId: string,
  onNotification: () => void,
): Promise<unknown> {
  return await pb
    .collection("notifications")
    .subscribe("*", onNotification, { filter: `user = "${userId}"` });
}

export function unsubscribeFromNotifications(): void {
  pb.collection("notifications").unsubscribe("*");
}
