import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconBell,
  IconBellOff,
  IconCheck,
  IconEye,
  IconSortAscending,
  IconTrash,
  IconTrashX,
} from "@tabler/icons-react";
import { format, isThisWeek, isToday, isYesterday } from "date-fns-jalali";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TEXT } from "@/constants/text";
import type { NotificationsRecord } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store/auth-store";
import {
  useClearAll,
  useClearRead,
  useDeleteNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useIsLoading,
  useNotificationError,
} from "@/store/notification-store";

type FilterType = "all" | "unread" | "read";
type SortType = "newest" | "oldest";

const formatNotificationTime = (dateString?: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return digitsEnToFa(format(date, "dd MMMM HH:mm"));
};

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
      return TEXT.notifications.groups.today;
    case "yesterday":
      return TEXT.notifications.groups.yesterday;
    case "thisWeek":
      return TEXT.notifications.groups.thisWeek;
    case "older":
      return TEXT.notifications.groups.older;
    default:
      return group;
  }
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: NotificationsRecord;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "group hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
        !notification.read && "bg-blue-50/50 dark:bg-blue-400/10",
      )}
    >
      {/* Actions - Left side */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkAsRead(notification.id)}
            className="h-7 w-7 p-0"
            title={TEXT.notifications.actions.markAsRead}
          >
            <IconEye className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(notification.id)}
          className="text-destructive hover:text-destructive h-7 w-7 p-0"
          title={TEXT.notifications.actions.delete}
        >
          <IconTrash className="h-3 w-3" />
        </Button>
      </div>

      {/* Notification Content */}
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
              {TEXT.notifications.types[notification.type]}
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-muted/50 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
        <IconBellOff className="text-muted-foreground/50 h-8 w-8" />
      </div>
      <h3 className="text-foreground mb-2 text-lg font-semibold">
        {TEXT.notifications.emptyState.title}
      </h3>
      <p className="text-muted-foreground text-sm">
        {TEXT.notifications.emptyState.description}
      </p>
    </div>
  );
}

export default function Notifications() {
  const user = useAuthUser();
  const notifications = useNotifications();
  const markAsRead = useMarkAsRead();

  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const clearAll = useClearAll();
  const clearRead = useClearRead();
  const isLoading = useIsLoading();
  const error = useNotificationError();

  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    switch (filter) {
      case "unread":
        filtered = notifications.filter((n) => !n.read);
        break;
      case "read":
        filtered = notifications.filter((n) => n.read);
        break;
      default:
        filtered = notifications;
    }

    // Sort notifications
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.created || "").getTime() -
            new Date(b.created || "").getTime()
          );
        case "newest":
        default:
          return (
            new Date(b.created || "").getTime() -
            new Date(a.created || "").getTime()
          );
      }
    });
  }, [notifications, filter, sort]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, NotificationsRecord[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    filteredNotifications.forEach((notification) => {
      const group = getDateGroup(notification.created);
      groups[group].push(notification);
    });

    return groups;
  }, [filteredNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-right">
          <h1 className="text-foreground flex items-center justify-end gap-2 text-xl font-bold md:text-2xl">
            <IconBell className="h-5 w-5 md:h-6 md:w-6" />
            {TEXT.notifications.pageTitle}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {TEXT.notifications.pageDescription}
          </p>
        </div>
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => user?.id && markAllAsRead(user.id)}
                    disabled={unreadCount === 0}
                    className="h-8 w-8 p-0"
                  >
                    <IconCheck className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{TEXT.notifications.markAllAsRead}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => user?.id && clearRead(user.id)}
                    disabled={notifications.filter((n) => n.read).length === 0}
                    className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  >
                    <IconTrashX className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{TEXT.notifications.actions.clearRead}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => user?.id && clearAll(user.id)}
                    disabled={notifications.length === 0}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{TEXT.notifications.clearAll}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IconBell className="text-primary h-5 w-5" />
              <div className="text-right">
                <p className="text-muted-foreground text-sm">
                  {TEXT.notifications.stats.total}
                </p>
                <p className="text-2xl font-bold">
                  {digitsEnToFa(notifications.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IconBellOff className="h-5 w-5 text-blue-500" />
              <div className="text-right">
                <p className="text-muted-foreground text-sm">
                  {TEXT.notifications.stats.unread}
                </p>
                <p className="text-2xl font-bold">
                  {digitsEnToFa(unreadCount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IconCheck className="h-5 w-5 text-green-500" />
              <div className="text-right">
                <p className="text-muted-foreground text-sm">
                  {TEXT.notifications.stats.read}
                </p>
                <p className="text-2xl font-bold">
                  {digitsEnToFa(notifications.filter((n) => n.read).length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IconTrash className="h-5 w-5 text-orange-500" />
              <div className="text-right">
                <p className="text-muted-foreground text-sm">
                  {TEXT.notifications.stats.deletable}
                </p>
                <p className="text-2xl font-bold">
                  {digitsEnToFa(notifications.filter((n) => n.read).length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sort */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as FilterType)}
        >
          <TabsList>
            <TabsTrigger value="all">
              {TEXT.notifications.filters.all}
            </TabsTrigger>
            <TabsTrigger value="unread">
              {TEXT.notifications.filters.unread}
            </TabsTrigger>
            <TabsTrigger value="read">
              {TEXT.notifications.filters.read}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <IconSortAscending className="ml-1 h-4 w-4" />
              {TEXT.notifications.sort[sort]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSort("newest")}>
              {TEXT.notifications.sort.newest}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSort("oldest")}>
              {TEXT.notifications.sort.oldest}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted/50 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <IconBell className="text-muted-foreground/50 h-8 w-8 animate-pulse" />
          </div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">
            Loading notifications...
          </h3>
          <p className="text-muted-foreground text-sm">
            Please wait while we fetch your notifications
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-destructive/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <IconBell className="text-destructive h-8 w-8" />
          </div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">
            Failed to load notifications
          </h3>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && !error && filteredNotifications.length === 0 ? (
        <EmptyState />
      ) : !isLoading && !error ? (
        <ScrollArea className="h-[600px]">
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(
              ([group, groupNotifications]) => {
                if (groupNotifications.length === 0) return null;

                return (
                  <div key={group}>
                    <h3 className="text-foreground mb-3 text-right text-sm font-semibold">
                      {getGroupTitle(group)}
                    </h3>
                    <div className="space-y-2">
                      {groupNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  );
}
