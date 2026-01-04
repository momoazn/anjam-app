import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconClock, IconEye, IconHash, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns-jalali";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { notifications as notificationsText, shared } from "@/constants";
import type { NotificationsRecord } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";

const formatNotificationTime = (dateString?: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return digitsEnToFa(format(date, "MM/dd HH:mm"));
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
        "group border-border/20 bg-card hover:bg-muted/30 relative flex items-stretch border-b transition-all duration-200",
        selected && "bg-primary/5",
        !notification.read && "border-e-primary border-e-2",
      )}
    >
      {/* Selection Zone */}
      <div className="border-border/10 bg-muted/5 flex w-12 shrink-0 items-center justify-center border-s">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggleSelect(notification.id)}
          className="size-4 rounded-md transition-transform hover:scale-110"
          aria-label={notificationsText.selected}
        />
      </div>

      {/* Main Content Zone */}
      <div className="flex min-w-0 grow flex-col justify-center px-4 py-3 text-right">
        <div className="mb-1 flex items-center justify-end gap-3">
          {!notification.read && (
            <div className="bg-primary size-2 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
          )}
          <h4
            className={cn(
              "truncate text-sm font-bold",
              !notification.read
                ? "text-foreground"
                : "text-muted-foreground/60",
            )}
          >
            {notification.title}
          </h4>
        </div>

        <p className="text-muted-foreground/80 line-clamp-2 text-xs leading-relaxed">
          {notification.message}
        </p>

        <div className="mt-3 flex items-center justify-end gap-4 opacity-40 transition-opacity group-hover:opacity-100">
          <div className="flex items-center gap-1.5">
            <IconHash className="size-3" />
            <span className="text-[10px] font-bold">
              {notification.id.slice(0, 8)}
            </span>
          </div>
          <Badge
            variant="outline"
            className="border-border/40 bg-muted/30 text-muted-foreground rounded-md px-1.5 py-0 text-[10px] font-bold"
          >
            {notificationsText.types[notification.type]}
          </Badge>
        </div>
      </div>

      {/*  & Actions Zone */}
      <div className="border-border/10 bg-muted/5 flex w-32 shrink-0 flex-col items-center justify-center gap-3 border-e px-4 py-3">
        <div className="flex flex-col items-center">
          <span className="text-muted-foreground/40 mb-1 text-[10px] font-bold">
            {shared.time}
          </span>
          <div className="text-foreground/60 flex items-center gap-1.5 text-[10px] font-bold tabular-nums">
            <IconClock className="text-primary/40 size-3" />
            {formatNotificationTime(notification.created)}
          </div>
        </div>

        <div className="flex translate-y-1 items-center gap-1 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMarkAsRead(notification.id)}
              className="hover:bg-primary/10 hover:text-primary size-8 rounded-lg transition-all"
              title={notificationsText.actions.markAsRead}
            >
              <IconEye className="size-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(notification.id)}
            className="size-8 rounded-lg text-rose-500/80 transition-all hover:bg-rose-500/10"
            title={notificationsText.actions.delete}
          >
            <IconTrash className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
