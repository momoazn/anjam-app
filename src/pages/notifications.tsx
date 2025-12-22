import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconBell,
  IconBellOff,
  IconCheck,
  IconTrash,
  IconTrashX,
} from "@tabler/icons-react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { NotificationFilters } from "@/components/notifications/notification-filters";
import {
  type NotificationFilter,
  type NotificationSort,
} from "@/components/notifications/notification-filters";
import { NotificationList } from "@/components/notifications/notification-list";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { common, notifications as notificationsText } from "@/constants";
import {
  useClearAll,
  useClearRead,
  useDeleteNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from "@/hooks/notifications";
import { useAuthUser } from "@/store/auth-store";

export default function Notifications() {
  const user = useAuthUser();
  const { data: notificationsData = [], isLoading, error } = useNotifications();
  const markAsRead = useMarkAsRead();

  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const clearAll = useClearAll();
  const clearRead = useClearRead();
  const pendingDeletesRef = useRef(new Map<string, number>());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [filter, setFilter] = useQueryState(
    "filter",
    parseAsStringEnum<NotificationFilter>([
      "all",
      "unread",
      "read",
    ]).withDefault("all"),
  );
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringEnum<NotificationSort>(["newest", "oldest"]).withDefault(
      "newest",
    ),
  );

  const filteredNotifications = useMemo(() => {
    let filtered = notificationsData;

    switch (filter) {
      case "unread":
        filtered = notificationsData.filter((n) => !n.read);
        break;
      case "read":
        filtered = notificationsData.filter((n) => n.read);
        break;
      default:
        filtered = notificationsData;
    }

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
  }, [notificationsData, filter, sort]);

  const unreadCount = notificationsData.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleDelete = (id: string) => {
    const existing = pendingDeletesRef.current.get(id);
    if (existing) {
      window.clearTimeout(existing);
    }

    const timeoutId = window.setTimeout(() => {
      pendingDeletesRef.current.delete(id);
      deleteNotification.mutate(id);
    }, 5000);

    pendingDeletesRef.current.set(id, timeoutId);

    toast(notificationsText.actions.deleteQueued, {
      duration: 5000,
      action: {
        label: common.undo,
        onClick: () => {
          const t = pendingDeletesRef.current.get(id);
          if (t) {
            window.clearTimeout(t);
            pendingDeletesRef.current.delete(id);
          }
        },
      },
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const bulkMarkRead = () => {
    selectedIds.forEach((id) => markAsRead.mutate(id));
    clearSelection();
  };

  const bulkDelete = () => {
    selectedIds.forEach((id) => handleDelete(id));
    clearSelection();
  };

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-right">
          <h1 className="text-foreground flex items-center gap-2 text-xl font-bold md:text-2xl">
            <IconBell className="h-5 w-5 md:h-6 md:w-6" />
            {notificationsText.pageTitle}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {notificationsText.pageDescription}
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
                    onClick={() => user?.id && markAllAsRead.mutate(user.id)}
                    disabled={unreadCount === 0}
                    className="h-8 w-8 p-0"
                    aria-label={notificationsText.markAllAsRead}
                  >
                    <IconCheck className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{notificationsText.markAllAsRead}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => user?.id && clearRead.mutate(user.id)}
                    disabled={
                      notificationsData.filter((n) => n.read).length === 0
                    }
                    className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                    aria-label={notificationsText.actions.clearRead}
                  >
                    <IconTrashX className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{notificationsText.actions.clearRead}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => user?.id && clearAll.mutate(user.id)}
                    disabled={notificationsData.length === 0}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                    aria-label={notificationsText.clearAll}
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{notificationsText.clearAll}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      <div
        className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4"
        data-animate-stagger
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IconBell className="text-primary h-5 w-5" />
              <div className="text-right">
                <p className="text-muted-foreground text-sm">
                  {notificationsText.stats.total}
                </p>
                <p className="text-2xl font-bold">
                  {digitsEnToFa(notificationsData.length)}
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
                  {notificationsText.stats.unread}
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
                  {notificationsText.stats.read}
                </p>
                <p className="text-2xl font-bold">
                  {digitsEnToFa(notificationsData.filter((n) => n.read).length)}
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
                  {notificationsText.stats.deletable}
                </p>
                <p className="text-2xl font-bold">
                  {digitsEnToFa(notificationsData.filter((n) => n.read).length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <NotificationFilters
        filter={filter}
        sort={sort}
        selectedIds={selectedIds}
        onFilterChange={(value) => {
          void setFilter(value);
        }}
        onSortChange={(value) => {
          void setSort(value);
        }}
        onBulkMarkRead={bulkMarkRead}
        onBulkDelete={bulkDelete}
        onClearSelection={clearSelection}
        isBulkDeletePending={deleteNotification.isPending}
      />

      <NotificationList
        notifications={filteredNotifications}
        isLoading={isLoading}
        error={error}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />
    </PageTransition>
  );
}
