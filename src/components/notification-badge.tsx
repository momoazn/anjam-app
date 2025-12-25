import { IconBell } from "@tabler/icons-react";
import { digitsEnToFa } from "@persian-tools/persian-tools";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notification, notifications } from "@/constants";
import { useUnreadCount } from "@/hooks/notifications";
import { cn } from "@/lib/utils";

type NotificationBadgeProps = {
  onClick?: () => void;
  className?: string;
};

export function NotificationBadge({
  onClick,
  className,
}: NotificationBadgeProps) {
  const unreadCount = useUnreadCount();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        "hover:bg-muted/80 relative h-8 w-8 transition-colors duration-200",
        className,
      )}
      title={
        unreadCount > 0
          ? `${unreadCount} ${notification.unreadCount}`
          : notifications.title
      }
      aria-label={
        unreadCount > 0
          ? `${digitsEnToFa(unreadCount)} ${notification.unreadCount}`
          : notifications.title
      }
    >
      <IconBell
        className={cn(
          "size-4 transition-transform duration-200",
          unreadCount > 0 && "animate-pulse",
        )}
        aria-hidden="true"
      />

      {/* Notification badge */}
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -end-1 -top-1 flex size-5 items-center justify-center p-0 text-xs font-medium shadow-sm"
          aria-label={`${unreadCount} ${notification.unreadCount}`}
        >
          {unreadCount > 99
            ? `${digitsEnToFa(99)}+`
            : digitsEnToFa(unreadCount)}
        </Badge>
      )}
    </Button>
  );
}
