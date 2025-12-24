import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconEye, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns-jalali";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { notifications as notificationsText } from "@/constants";
import type { NotificationsRecord } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";

const formatNotificationTime = (dateString?: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return digitsEnToFa(format(date, "dd MMMM HH:mm"));
};

type NotificationItemProps = {
  notification: NotificationsRecord;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  selected: boolean;
  onToggleSelect: (id: string) => void;
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  selected,
  onToggleSelect,
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        "group hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
        !notification.read && "bg-blue-50/50 dark:bg-blue-400/10",
      )}
      data-interactive-item
    >
      <div className="pt-1">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggleSelect(notification.id)}
          aria-label={notificationsText.selected}
        />
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkAsRead(notification.id)}
            className="h-7 w-7 p-0"
            title={notificationsText.actions.markAsRead}
            aria-label={notificationsText.actions.markAsRead}
          >
            <IconEye className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(notification.id)}
          className="text-destructive hover:text-destructive h-7 w-7 p-0"
          title={notificationsText.actions.delete}
          aria-label={notificationsText.actions.delete}
        >
          <IconTrash className="h-3 w-3" />
        </Button>
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-right">
          <div className="mb-1 flex items-center justify-end gap-2">
            {!notification.read && (
              <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
            )}
            <h4
              className={cn(
                "truncate text-sm font-medium",
                !notification.read
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {notification.title}
            </h4>
          </div>
          <p className="text-muted-foreground mb-2 line-clamp-2 text-right text-xs">
            {notification.message}
          </p>
          <div className="flex items-center justify-end gap-2">
            <Badge variant="outline" className="text-xs">
              {notificationsText.types[notification.type]}
            </Badge>
            <time
              dateTime={notification.created || ""}
              className="text-muted-foreground text-xs"
            >
              {formatNotificationTime(notification.created)}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
}
