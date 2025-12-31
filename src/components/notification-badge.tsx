import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconBell } from "@tabler/icons-react";

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
        "hover:bg-muted/50 relative h-9 w-9 rounded-lg transition-all duration-200",
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
          "size-5 transition-transform duration-200",
          unreadCount > 0 ? "text-primary" : "text-muted-foreground",
        )}
        aria-hidden="true"
        stroke={2}
      />

      {/* Notification badge */}
      {unreadCount > 0 && (
        <div
          className="border-background bg-primary text-primary-foreground absolute -end-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border-2 px-1 text-[9px] font-bold shadow-sm"
          aria-label={`${unreadCount} ${notification.unreadCount}`}
        >
          {unreadCount > 99
            ? `${digitsEnToFa(99)}+`
            : digitsEnToFa(unreadCount)}
        </div>
      )}
    </Button>
  );
}
