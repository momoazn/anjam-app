import { IconBell, IconBellOff } from "@tabler/icons-react";
import { isThisWeek, isToday, isYesterday } from "date-fns-jalali";

import { NotificationItem } from "@/components/notifications/notification-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notifications as notificationsText } from "@/constants";
import type { NotificationsRecord } from "@/lib/pocketbase-types";

const getDateGroup = (dateString?: string | null) => {
  if (!dateString) return "older";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "older";

  if (isToday(date)) return "today";
  if (isYesterday(date)) return "yesterday";
  if (isThisWeek(date)) return "thisWeek";
  return "older";
};

const getGroupTitle = (group: string) => {
  switch (group) {
    case "today":
      return notificationsText.groups.today;
    case "yesterday":
      return notificationsText.groups.yesterday;
    case "thisWeek":
      return notificationsText.groups.thisWeek;
    case "older":
      return notificationsText.groups.older;
    default:
      return group;
  }
};

const EmptyState = () => (
  <div
    className="flex flex-col items-center justify-center py-12 text-center"
    data-animate-stagger
  >
    <div
      className="bg-muted/50 mb-4 flex h-16 w-16 items-center justify-center rounded-full"
      data-interactive-pulse
    >
      <IconBellOff className="text-muted-foreground/50 h-8 w-8" />
    </div>
    <h3 className="text-foreground mb-2 text-lg font-semibold">
      {notificationsText.emptyState.title}
    </h3>
    <p className="text-muted-foreground text-sm">
      {notificationsText.emptyState.description}
    </p>
  </div>
);

type NotificationListProps = {
  notifications: NotificationsRecord[];
  isLoading: boolean;
  error: unknown;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
};

export function NotificationList({
  notifications,
  isLoading,
  error,
  selectedIds,
  onToggleSelect,
  onMarkAsRead,
  onDelete,
}: NotificationListProps) {
  const groupedNotifications = notifications.reduce(
    (groups, notification) => {
      const group = getDateGroup(notification.created);
      groups[group].push(notification);
      return groups;
    },
    {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    } as Record<string, NotificationsRecord[]>,
  );

  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        data-animate-stagger
      >
        <div
          className="bg-muted/50 mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          data-interactive-pulse
        >
          <IconBell className="text-muted-foreground/50 h-8 w-8 animate-pulse" />
        </div>
        <h3 className="text-foreground mb-2 text-lg font-semibold">
          Loading notificationsText...
        </h3>
        <p className="text-muted-foreground text-sm">
          Please wait while we fetch your notifications
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        data-animate-stagger
      >
        <div className="bg-destructive/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <IconBell className="text-destructive h-8 w-8" />
        </div>
        <h3 className="text-foreground mb-2 text-lg font-semibold">
          Failed to load notifications
        </h3>
        <p className="text-muted-foreground text-sm">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return <EmptyState />;
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-6" data-animate-stagger>
        {Object.entries(groupedNotifications).map(
          ([group, groupNotifications]) => {
            if (groupNotifications.length === 0) return null;

            return (
              <div key={group}>
                <h3 className="text-foreground mb-3 text-right text-sm font-semibold">
                  {getGroupTitle(group)}
                </h3>
                <div className="space-y-2" data-animate-stagger>
                  {groupNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                      onDelete={onDelete}
                      selected={selectedIds.includes(notification.id)}
                      onToggleSelect={onToggleSelect}
                    />
                  ))}
                </div>
              </div>
            );
          },
        )}
      </div>
    </ScrollArea>
  );
}
