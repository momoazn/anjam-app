import { IconBell, IconTerminal } from "@tabler/icons-react";
import { isThisWeek, isToday, isYesterday } from "date-fns-jalali";

import { NotificationItem } from "@/components/notifications/notification-item";
import { NotificationSkeleton } from "@/components/notifications/notification-skeleton";
import { EmptyStateNoNotifications } from "@/components/ui/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notifications as notificationsText, shared } from "@/constants";

const getDateGroup = (timestamp?: number | null) => {
  if (!timestamp) return "older";
  const date = new Date(timestamp);
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

type NotificationListProps = {
  notifications: any[];
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
  const groupedNotifications: Record<
    "today" | "yesterday" | "thisWeek" | "older",
    any[]
  > = notifications.reduce(
    (groups: Record<"today" | "yesterday" | "thisWeek" | "older", any[]>, notification: any) => {
      const group = getDateGroup(notification.createdAt);
      if (group === "today" || group === "yesterday" || group === "thisWeek" || group === "older") {
        groups[group].push(notification);
      } else {
        groups.older.push(notification);
      }
      return groups;
    },
    {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    },
  );

  if (isLoading) {
    return <NotificationSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-xl bg-rose-500/10">
          <IconBell className="size-10 text-rose-500" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-rose-500">{shared.error}</h3>
        <p className="text-muted-foreground text-sm font-medium">
          {error instanceof Error
            ? error.message
            : "نتوانستیم اعلان‌ها را بارگذاری کنیم"}
        </p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return <EmptyStateNoNotifications />;
  }

  return (
    <ScrollArea className="h-[calc(100vh-24rem)]">
      <div className="space-y-10" data-animate-stagger>
        {(Object.entries(groupedNotifications) as Array<[string, any[]]>).map(
          ([group, groupNotifications]) => {
            if (groupNotifications.length === 0) return null;

            return (
              <div key={group} className="relative">
                <div className="bg-muted/5 border-border/20 sticky top-0 z-10 mb-4 flex items-center gap-4 border-y px-4 py-2 backdrop-blur-sm">
                  <IconTerminal className="text-primary/60 size-4" />
                  <h3 className="text-foreground text-xs font-bold">
                    {getGroupTitle(group)}
                  </h3>
                  <div className="bg-border/20 h-px flex-1" />
                </div>

                <div
                  className="border-border/20 overflow-hidden rounded-xl border shadow-sm"
                  data-animate-stagger
                >
                  {groupNotifications.map((notification: any) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                      onDelete={onDelete}
                      selected={selectedIds.includes(notification._id)}
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
