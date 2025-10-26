import { pb } from "@/lib/pocketbase";
import type { NotificationsRecord } from "@/lib/pocketbase-types";
import type { RecordSubscription, UnsubscribeFunc } from "pocketbase";

export interface NotificationFilters {
  user?: string;
  read?: boolean;
  type?: string;
  limit?: number;
  sort?: string;
}

export interface NotificationSubscriptionOptions {
  filter?: string;
  expand?: string;
  fields?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private subscriptions: Map<string, UnsubscribeFunc> = new Map();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Fetch notifications from PocketBase with filters
   */
  async fetchNotifications(
    filters: NotificationFilters = {},
  ): Promise<NotificationsRecord[]> {
    try {
      const queryParams: Record<string, string | number> = {
        page: 1,
        perPage: filters.limit || 100,
        sort: filters.sort || "-created",
      };

      // Build filter string
      const filterParts: string[] = [];
      if (filters.user) {
        filterParts.push(`user = "${filters.user}"`);
      }
      if (filters.read !== undefined) {
        filterParts.push(`read = ${filters.read}`);
      }
      if (filters.type) {
        filterParts.push(`type = "${filters.type}"`);
      }

      if (filterParts.length > 0) {
        queryParams.filter = filterParts.join(" && ");
      }

      const result = await pb
        .collection("notifications")
        .getList<NotificationsRecord>(
          queryParams.page as number,
          queryParams.perPage as number,
          queryParams,
        );

      return result.items;
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      throw error;
    }
  }

  /**
   * Fetch a single notification by ID
   */
  async fetchNotification(id: string): Promise<NotificationsRecord> {
    try {
      return await pb
        .collection("notifications")
        .getOne<NotificationsRecord>(id);
    } catch (error) {
      console.error(`Failed to fetch notification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a notification
   */
  async updateNotification(
    id: string,
    data: Partial<NotificationsRecord>,
  ): Promise<NotificationsRecord> {
    try {
      return await pb
        .collection("notifications")
        .update<NotificationsRecord>(id, data);
    } catch (error) {
      console.error(`Failed to update notification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<boolean> {
    try {
      await pb.collection("notifications").delete(id);
      return true;
    } catch (error) {
      console.error(`Failed to delete notification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<NotificationsRecord> {
    return this.updateNotification(id, { read: true });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.fetchNotifications({
        user: userId,
        read: false,
      });
      const updatePromises = notifications.map((notification) =>
        this.updateNotification(notification.id, { read: true }),
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      throw error;
    }
  }

  /**
   * Clear all notifications for a user
   */
  async clearAll(userId: string): Promise<void> {
    try {
      const notifications = await this.fetchNotifications({ user: userId });
      const deletePromises = notifications.map((notification) =>
        this.deleteNotification(notification.id),
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
      throw error;
    }
  }

  /**
   * Clear read notifications for a user
   */
  async clearRead(userId: string): Promise<void> {
    try {
      const notifications = await this.fetchNotifications({
        user: userId,
        read: true,
      });
      const deletePromises = notifications.map((notification) =>
        this.deleteNotification(notification.id),
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Failed to clear read notifications:", error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time notifications for a user
   */
  async subscribeToNotifications(
    userId: string,
    onNotification: (e: RecordSubscription<NotificationsRecord>) => void,
    options: NotificationSubscriptionOptions = {},
  ): Promise<string> {
    const subscriptionId = `notifications-${userId}-${Date.now()}`;

    try {
      const subscriptionOptions: Record<string, string> = {
        filter: `user.id = "${userId}"`,
        ...options,
      };

      const unsubscribe = await pb
        .collection("notifications")
        .subscribe("*", onNotification, subscriptionOptions);

      this.subscriptions.set(subscriptionId, unsubscribe);

      return subscriptionId;
    } catch (error) {
      console.error("Failed to subscribe to notifications:", error);
      throw error;
    }
  }

  /**
   * Unsubscribe from notifications
   */
  unsubscribeFromNotifications(subscriptionId: string): void {
    const unsubscribe = this.subscriptions.get(subscriptionId);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Unsubscribe from all notifications
   */
  unsubscribeFromAll(): void {
    this.subscriptions.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.subscriptions.clear();
  }

  /**
   * Get active subscriptions count
   */
  getActiveSubscriptionsCount(): number {
    return this.subscriptions.size;
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
