import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconActivity,
  IconBell,
  IconCheck,
  IconCircleCheck,
  IconClock,
  IconTrash,
  IconTrashX,
} from "@tabler/icons-react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { NotificationFilters } from "@/components/notifications/notification-filters";
import type {
  NotificationFilter,
  NotificationSort,
} from "@/components/notifications/notification-filters";
import { NotificationList } from "@/components/notifications/notification-list";
import { MentionsList } from "@/components/notifications/mentions-list";
import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
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
import { useMentions } from "@/hooks";
import type { MentionsResponse } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default function Notifications() {
  const user = useAuthUser();
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
          new Date(a.created || "").getTime() -
          new Date(b.created || "").getTime()
        );
      }
      return (
        new Date(b.created || "").getTime() -
        new Date(a.created || "").getTime()
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
      <div className="bg-muted/20 border-border/40 flex items-center gap-2 border p-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => user?.id && markAllAsRead.mutate(user.id)}
              disabled={unreadCount === 0}
              className="hover:bg-primary/10 hover:text-primary size-10 rounded-none transition-all disabled:opacity-20"
            >
              <IconCheck className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="border-border bg-card text-foreground rounded-none border text-[9px] font-black tracking-tight uppercase">
            {notificationsText.markAllAsRead}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => user?.id && clearRead.mutate(user.id)}
              disabled={readCount === 0}
              className="size-10 rounded-none text-amber-500 transition-all hover:bg-amber-500/10 disabled:opacity-20"
            >
              <IconTrashX className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="border-border bg-card text-foreground rounded-none border text-[9px] font-black tracking-tight uppercase">
            {notificationsText.actions.clearRead}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => user?.id && clearAll.mutate(user.id)}
              disabled={notificationsData.length === 0}
              className="size-10 rounded-none text-rose-500 transition-all hover:bg-rose-500/10 disabled:opacity-20"
            >
              <IconTrash className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="border-border bg-card text-foreground rounded-none border text-[9px] font-black tracking-tight uppercase">
            {notificationsText.clearAll}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      <PageHeader
        title={notificationsText.pageTitle}
        description={notificationsText.pageDescription}
        icon={IconBell}
        actions={headerActions}
      />

      {/* Stats Bar */}
      <Card className="border-border/40 mb-8 overflow-hidden rounded-none shadow-sm">
        <CardContent className="bg-border/40 grid grid-cols-2 gap-px p-0 sm:grid-cols-4">
          {[
            {
              label: notificationsText.stats.total,
              value: notificationsData.length,
              icon: IconActivity,
              color: "text-primary",
            },
            {
              label: notificationsText.stats.unread,
              value: unreadCount,
              icon: IconClock,
              color: "text-amber-500",
            },
            {
              label: notificationsText.stats.read,
              value: readCount,
              icon: IconCircleCheck,
              color: "text-emerald-500",
            },
            {
              label: notificationsText.stats.deletable,
              value: readCount,
              icon: IconTrash,
              color: "text-rose-500",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card hover:bg-muted/10 p-6 text-right transition-colors"
            >
              <div className="mb-2 flex items-center justify-end gap-3">
                <span className="text-muted-foreground/40 text-[10px] font-black tracking-tight uppercase">
                  {stat.label}
                </span>
                <stat.icon className={cn("size-4", stat.color)} />
              </div>
              <div className="text-3xl font-black tracking-tighter">
                {digitsEnToFa(stat.value)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/40 overflow-hidden rounded-none shadow-sm">
        <CardContent className="bg-muted/5 p-6">
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
        </CardContent>
      </Card>

      <MentionsList
        mentions={mentionsData as MentionsResponse[]}
        isLoading={mentionsLoading}
      />
    </PageTransition>
  );
}
