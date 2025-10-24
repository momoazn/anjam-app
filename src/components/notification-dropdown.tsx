import { IconCheck, IconTrash, IconEye } from "@tabler/icons-react";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format } from "date-fns-jalali";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBadge } from "@/components/notification-badge";
import { TEXT } from "@/constants/text";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useClearAll,
} from "@/store/notification-store";
import type { NotificationsRecord } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  align?: "start" | "center" | "end";
}

const formatNotificationTime = (dateString?: string | null) => {
  if (!dateString) {
    return "-";
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return digitsEnToFa(format(date, "dd MMMM HH:mm"));
};

function NotificationItem({
  notification,
}: {
  notification: NotificationsRecord;
}) {
  const markAsRead = useMarkAsRead();

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.id);
  };

  return (
    <div
      className={cn(
        "group hover:bg-muted/50 focus-within:ring-ring flex cursor-pointer items-start justify-between rounded-md px-3 py-2.5 transition-colors duration-200 ease-in-out focus-within:ring-2 focus-within:ring-offset-2",
        !notification.read && "bg-blue-50/50 dark:bg-blue-400/10",
      )}
      role="listitem"
      aria-label={`اعلان: ${notification.title}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {/* Notification indicator */}
          <div
            className={cn(
              "mt-1 size-2 flex-shrink-0 rounded-full",
              !notification.read ? "bg-blue-500" : "bg-muted",
            )}
          />

          <div className="min-w-0 flex-1">
            <h4
              className={cn(
                "truncate text-sm font-medium",
                !notification.read
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
              id={`notification-title-${notification.id}`}
            >
              {notification.title}
            </h4>
            <p
              className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed"
              aria-describedby={`notification-title-${notification.id}`}
            >
              {notification.message}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <time
                dateTime={notification.created || ""}
                className="text-muted-foreground text-xs"
              >
                {formatNotificationTime(notification.created)}
              </time>
              {!notification.read && (
                <Badge
                  variant="secondary"
                  className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  جدید
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {!notification.read && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAsRead}
          className="h-7 w-7 shrink-0 p-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          title={TEXT.notifications.buttons.markAsRead}
          aria-label={`علامت‌گذاری اعلان "${notification.title}" به عنوان خوانده شده`}
        >
          <IconCheck className="size-3" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

export function NotificationDropdown({
  align = "end",
}: NotificationDropdownProps) {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const markAllAsRead = useMarkAllAsRead();
  const clearAll = useClearAll();

  const recentNotifications = notifications.slice(0, 10); // Show last 10 notifications

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <NotificationBadge />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="w-96 p-0"
        aria-label="پنل اعلان‌ها"
      >
        {/* Header */}
        <div className="bg-muted/30 flex items-center justify-between border-b px-4 py-3">
          <h3
            className="text-foreground font-semibold"
            id="notifications-heading"
          >
            {TEXT.notifications.title}
          </h3>
          {notifications.length > 0 && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="hover:bg-muted/80 h-7 px-2 text-xs"
                title={TEXT.notifications.markAllAsRead}
                aria-label={TEXT.notifications.markAllAsRead}
              >
                <IconCheck className="ml-1 size-3" aria-hidden="true" />
                {TEXT.notifications.markAllAsRead}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="hover:bg-destructive/10 hover:text-destructive h-7 px-2 text-xs"
                title={TEXT.notifications.clearAll}
                aria-label={TEXT.notifications.clearAll}
              >
                <IconTrash className="ml-1 size-3" aria-hidden="true" />
                {TEXT.notifications.clearAll}
              </Button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        {recentNotifications.length === 0 ? (
          <div
            className="text-muted-foreground flex flex-col items-center justify-center p-8 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="bg-muted/50 mb-3 flex size-12 items-center justify-center rounded-full">
              <IconCheck className="text-muted-foreground/50 size-5" />
            </div>
            <p className="text-sm font-medium">
              {TEXT.notifications.noNotifications}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              اعلان‌های جدید اینجا نمایش داده خواهند شد
            </p>
          </div>
        ) : (
          <div
            className="max-h-96 overflow-y-auto"
            role="list"
            aria-labelledby="notifications-heading"
            aria-live="polite"
          >
            {recentNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}

        {/* Footer with count and view all */}
        {notifications.length > 0 && (
          <div className="bg-muted/20 border-t px-4 py-2">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">
                نمایش {digitsEnToFa(Math.min(10, notifications.length))} از{" "}
                {digitsEnToFa(notifications.length)} اعلان
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/notifications")}
                className="h-6 px-2 text-xs"
              >
                <IconEye className="ml-1 h-3 w-3" />
                {TEXT.notifications.actions.viewAll}
              </Button>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
