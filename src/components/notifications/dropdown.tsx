import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconActivity,
  IconBellOff,
  IconCheck,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";
import { format } from "date-fns-jalali";
import { useNavigate } from "react-router-dom";

import { NotificationBadge } from "@/components/notification-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  notification as notificationText,
  notifications as notificationsText,
} from "@/constants";
import {
  useNotificationMutation,
  useNotifications,
} from "@/hooks/notifications";
import { cn } from "@/lib/utils";

type NotificationRecord = {
  _id: string;
  createdAt: number;
  read: boolean;
  title: string;
  message: string;
};

type NotificationDropdownProps = {
  align?: "start" | "center" | "end";
};

const formatNotificationTime = (timestamp?: number | null) => {
  if (!timestamp) {
    return "-";
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return digitsEnToFa(format(date, "d MMMM HH:mm"));
};

function NotificationItem({
  notification,
}: {
  notification: NotificationRecord;
}) {
  const markAsReadMutation = useNotificationMutation("markRead");

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsReadMutation.mutate(notification._id);
  };

  return (
    <div
      className={cn(
        "group hover:bg-muted/50 relative flex cursor-pointer items-start gap-3 border-b px-4 py-4 transition-all duration-200",
        !notification.read && "bg-primary/5",
      )}
      role="listitem"
      aria-label={`${notificationText.notificationsLabel}: ${notification.title}`}
      dir="rtl"
    >
      {/* Status Bar Indicator */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 w-1 transition-all duration-300",
          !notification.read ? "bg-primary" : "bg-transparent",
        )}
      />

      <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
        <IconActivity
          className={cn(
            "size-4",
            !notification.read ? "text-primary" : "text-muted-foreground",
          )}
          stroke={2}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              "text-right text-sm font-bold",
              !notification.read ? "text-foreground" : "text-muted-foreground",
            )}
            id={`notification-title-${notification._id}`}
            dir="auto"
          >
            {notification.title}
          </h4>
          <time
            dateTime={new Date(notification.createdAt).toISOString()}
            className="text-muted-foreground shrink-0 text-[10px] font-medium"
          >
            {formatNotificationTime(notification.createdAt)}
          </time>
        </div>

        <p
          className="text-muted-foreground mt-1 line-clamp-2 text-right text-xs leading-relaxed"
          aria-describedby={`notification-title-${notification._id}`}
          dir="auto"
        >
          {notification.message}
        </p>

        {!notification.read && (
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAsRead}
              className="h-7 rounded-md px-3 text-[10px] font-bold"
            >
              <IconCheck className="me-1.5 size-3" stroke={3} />
              {notificationsText.buttons.markAsRead}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function NotificationDropdown({
  align = "end",
}: NotificationDropdownProps) {
  const navigate = useNavigate();
  const { data: notificationsData = [] } = useNotifications();
  const markAllAsRead = useNotificationMutation("markAllRead");
  const clearAll = useNotificationMutation("clearAll");

  const recentNotifications = (notificationsData as NotificationRecord[]).slice(
    0,
    10,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer">
          <NotificationBadge />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="bg-card mt-2 w-[26rem] max-w-[95vw] overflow-hidden rounded-xl border p-0 shadow-xl"
        aria-label={notificationText.notificationsPanel}
      >
        {/* Header */}
        <div className="bg-muted/30 border-b px-4 py-4" dir="rtl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <IconActivity className="size-4" stroke={2.5} />
              </div>
              <h3 className="text-base font-bold" id="notifications-heading">
                {notificationsText.title}
              </h3>
            </div>

            {notificationsData.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => markAllAsRead.mutate()}
                  className="gap-1"
                >
                  <IconCheck className="me-1.5 size-3" stroke={3} />
                  {notificationsText.markAllAsRead}
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => clearAll.mutate()}
                  className="gap-1 text-destructive hover:bg-destructive/10"
                >
                  <IconTrash className="me-1.5 size-3" stroke={3} />
                  {notificationsText.clearAll}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {recentNotifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            role="status"
            aria-live="polite"
            dir="rtl"
          >
            <div className="mb-4 flex justify-center">
              <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
                <IconBellOff
                  className="text-muted-foreground/40 size-7"
                  stroke={1.5}
                />
              </div>
            </div>
            <p className="text-foreground/60 text-base font-bold">
              {notificationsText.noNotifications}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {notificationText.newNotifications}
            </p>
          </div>
        ) : (
          <div
            className="max-h-[28rem] overflow-y-auto"
            role="list"
            aria-labelledby="notifications-heading"
            aria-live="polite"
            dir="rtl"
          >
            {recentNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        {notificationsData.length > 0 && (
          <div className="bg-muted/30 border-t px-4 py-3" dir="rtl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
                <p className="text-muted-foreground text-[10px] font-bold">
                  {notificationText.showCount.replace(
                    "{count}",
                    digitsEnToFa(Math.min(10, notificationsData.length)),
                  )}{" "}
                  / {digitsEnToFa(notificationsData.length)}{" "}
                  {notificationText.notificationWord}
                </p>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate("/notifications")}
                className="text-primary h-auto p-0 text-xs font-bold hover:no-underline"
              >
                {notificationsText.actions.viewAll}
                <IconEye className="ms-1.5 size-4" stroke={2.5} />
              </Button>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
