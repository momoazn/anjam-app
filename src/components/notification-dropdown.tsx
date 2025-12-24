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
import {
  notification as notificationText,
  notifications as notificationsText,
} from "@/constants";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useClearAll,
} from "@/hooks/notifications";
import { useAuthUser } from "@/store/auth-store";
import type { NotificationsRecord } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";

type NotificationDropdownProps = {
  align?: "start" | "center" | "end";
};

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
  const markAsReadMutation = useMarkAsRead();

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsReadMutation.mutate(notification.id);
  };

  return (
    <div
      className={cn(
        "group hover:bg-muted/50 focus-within:ring-ring flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 transition-colors duration-200 ease-in-out focus-within:ring-2 focus-within:ring-offset-2",
        !notification.read && "bg-blue-50/50 dark:bg-blue-400/10",
      )}
      role="listitem"
      aria-label={`${notificationText.notificationsLabel}: ${notification.title}`}
      dir="rtl"
    >
      {/* Notification indicator */}
      <div
        className={cn(
          "mt-1.5 size-2 flex-shrink-0 rounded-full",
          !notification.read ? "bg-blue-500" : "bg-muted",
        )}
      />

      <div className="min-w-0 flex-1">
        <h4
          className={cn(
            "text-right text-sm leading-relaxed font-medium",
            !notification.read ? "text-foreground" : "text-muted-foreground",
          )}
          id={`notification-title-${notification.id}`}
          dir="auto"
        >
          {notification.title}
        </h4>
        <p
          className="text-muted-foreground mt-1 line-clamp-2 text-right text-xs leading-relaxed"
          aria-describedby={`notification-title-${notification.id}`}
          dir="auto"
        >
          {notification.message}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
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
                {notificationText.new}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {!notification.read && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAsRead}
          className="h-7 w-7 shrink-0 p-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          title={notificationsText.buttons.markAsRead}
          aria-label={notificationText.markAsReadLabel.replace(
            "{title}",
            notification.title,
          )}
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
  const user = useAuthUser();
  const { data: notificationsData = [] } = useNotifications();
  const markAllAsRead = useMarkAllAsRead();
  const clearAll = useClearAll();

  const recentNotifications = notificationsData.slice(0, 10); // Show last 10 notifications

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <NotificationBadge />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="mt-1 ml-4 w-[28rem] max-w-[90vw] p-0"
        aria-label={notificationText.notificationsPanel}
      >
        {/* Header */}
        <div
          className="bg-muted/30 flex items-center justify-between border-b px-4 py-3"
          dir="rtl"
        >
          <h3
            className="text-foreground flex-1 truncate text-right font-semibold"
            id="notifications-heading"
          >
            {notificationsText.title}
          </h3>
          {notificationsData.length > 0 && (
            <div className="mr-3 flex flex-shrink-0 gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => user?.id && markAllAsRead.mutate(user.id)}
                className="hover:bg-muted/80 h-7 px-2 text-xs"
                title={notificationsText.markAllAsRead}
                aria-label={notificationsText.markAllAsRead}
              >
                <IconCheck className="ml-1 size-3" aria-hidden="true" />
                {notificationsText.markAllAsRead}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => user?.id && clearAll.mutate(user.id)}
                className="hover:bg-destructive/10 hover:text-destructive h-7 px-2 text-xs"
                title={notificationsText.clearAll}
                aria-label={notificationsText.clearAll}
              >
                <IconTrash className="ml-1 size-3" aria-hidden="true" />
                {notificationsText.clearAll}
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
            dir="rtl"
          >
            <div className="bg-muted/50 mb-3 flex size-12 items-center justify-center rounded-full">
              <IconCheck className="text-muted-foreground/50 size-5" />
            </div>
            <p className="text-sm font-medium">
              {notificationsText.noNotifications}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {notificationText.newNotifications}
            </p>
          </div>
        ) : (
          <div
            className="max-h-96 overflow-y-auto"
            role="list"
            aria-labelledby="notifications-heading"
            aria-live="polite"
            dir="rtl"
          >
            {recentNotifications.map((notification: NotificationsRecord) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}

        {/* Footer with count and view all */}
        {notificationsData.length > 0 && (
          <div className="bg-muted/20 border-t px-4 py-2" dir="rtl">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-right text-xs">
                {notificationText.showCount.replace(
                  "{count}",
                  digitsEnToFa(Math.min(10, notificationsData.length)),
                )}{" "}
                {digitsEnToFa(notificationsData.length)}{" "}
                {notificationText.notificationWord}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/notifications")}
                className="h-6 px-2 text-xs"
              >
                <IconEye className="ml-1 h-3 w-3" />
                {notificationsText.actions.viewAll}
              </Button>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
