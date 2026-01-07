import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconBell,
  IconCheck,
  IconTrash,
  IconTrashX,
} from "@tabler/icons-react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { MentionsList } from "@/components/notifications/mentions-list";
import { NotificationFilters } from "@/components/notifications/notification-filters";
import type {
  NotificationFilter,
  NotificationSort,
} from "@/components/notifications/notification-filters";
import { NotificationList } from "@/components/notifications/notification-list";
import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { common, notifications as notificationsText } from "@/constants";
import { useMentions } from "@/hooks";
import {
  useClearAll,
  useClearRead,
  useDeleteNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from "@/hooks/notifications";

export default function Notifications() {
  const { data: notificationsData = [], isLoading, error } = useNotifications();
  const { data: mentionsData = [], isLoading: mentionsLoading } = useMentions();
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
      if (sort === "oldest") {
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      }
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });
  }, [notificationsData, filter, sort]);

  const unreadCount = notificationsData.filter((n) => !n.read).length;
  const readCount = notificationsData.filter((n) => n.read).length;

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

  const bulkMarkRead = () => {
    selectedIds.forEach((id) => {
      markAsRead.mutate(id);
    });
    setSelectedIds([]);
  };

  const bulkDelete = () => {
    selectedIds.forEach((id) => {
      handleDelete(id);
    });
    setSelectedIds([]);
  };

  const headerActions = (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => markAllAsRead.mutate()}
              disabled={unreadCount === 0}
              className="hover:bg-primary/10 hover:text-primary size-9 rounded-lg transition-all disabled:opacity-20"
            >
              <IconCheck className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="border-border bg-card text-foreground rounded-md border text-xs font-bold">
            {notificationsText.markAllAsRead}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => clearRead.mutate()}
              disabled={readCount === 0}
              className="hover:bg-amber-500/10 size-9 rounded-lg text-amber-500 transition-all disabled:opacity-20"
            >
              <IconTrashX className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="border-border bg-card text-foreground rounded-md border text-xs font-bold">
            {notificationsText.actions.clearRead}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => clearAll.mutate()}
              disabled={notificationsData.length === 0}
              className="hover:bg-rose-500/10 size-9 rounded-lg text-rose-500 transition-all disabled:opacity-20"
            >
              <IconTrash className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="border-border bg-card text-foreground rounded-md border text-xs font-bold">
            {notificationsText.clearAll}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );

  return (
    <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
      <PageHeader
        title={notificationsText.pageTitle}
        subtitle={notificationsText.pageDescription}
        icon={IconBell}
        actions={headerActions}
      />

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground">
        <span>
          {notificationsText.stats.total}:{" "}
          {digitsEnToFa(notificationsData.length)}
        </span>
        <span>
          {notificationsText.stats.unread}: {digitsEnToFa(unreadCount)}
        </span>
        <span>
          {notificationsText.stats.read}: {digitsEnToFa(readCount)}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30">
        <div className="p-4">
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
            onClearSelection={() => setSelectedIds([])}
            isBulkDeletePending={deleteNotification.isPending}
          />

          <NotificationList
            notifications={filteredNotifications}
            isLoading={isLoading}
            error={error}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onMarkAsRead={(id) => markAsRead.mutate(id)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <MentionsList mentions={mentionsData} isLoading={mentionsLoading} />
    </PageTransition>
  );
}
