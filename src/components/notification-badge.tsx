import { IconBell } from "@tabler/icons-react";
import { digitsEnToFa } from "@persian-tools/persian-tools";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TEXT } from "@/constants/text";
import { useUnreadCount } from "@/hooks/notifications";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  onClick?: () => void;
  className?: string;
}

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
          ? `${unreadCount} ${TEXT.notification.unreadCount}`
          : TEXT.notifications.title
      }
      aria-label={
        unreadCount > 0
          ? `${digitsEnToFa(unreadCount)} ${TEXT.notification.unreadCount}`
          : TEXT.notifications.title
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
          className="absolute -top-1 -right-1 flex size-5 items-center justify-center p-0 text-xs font-medium shadow-sm"
          aria-label={`${unreadCount} ${TEXT.notification.unreadCount}`}
        >
          {unreadCount > 99 ? "۹۹+" : digitsEnToFa(unreadCount)}
        </Badge>
      )}
    </Button>
  );
}
