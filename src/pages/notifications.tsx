import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconBell,
  IconCheck,
  IconTrash,
  IconTrashX,
  IconActivity,
  IconCircleCheck,
  IconClock,
  IconStack2,
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
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { common, notifications as notificationsText, app } from "@/constants";
import {
  useClearAll,
  useClearRead,
  useDeleteNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from "@/hooks/notifications";
import { useAuthUser } from "@/store/auth-store";
import { cn } from "@/lib/utils";

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

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      {/* Registry Header Console */}
      <div className="border-border/40 bg-card relative mb-8 overflow-hidden rounded-none border p-8 shadow-xl">
        {/* Blueprint Grid Backdrop */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5">
            <div className="bg-primary/10 text-primary border-primary/20 flex size-14 items-center justify-center rounded-none border">
              <IconBell className="size-7" />
            </div>
            <div>
              <div className="text-primary flex items-center gap-2">
                <IconStack2 className="size-3" />
                <span className="text-muted-foreground/60 text-[10px] font-black tracking-[0.2em] uppercase">
                  {app.name} / Alert_Central
                </span>
              </div>
              <h1 className="mt-1 text-right text-3xl font-black tracking-tight uppercase md:text-4xl">
                {notificationsText.pageTitle}
              </h1>
              <p className="text-muted-foreground mt-2 text-right text-sm leading-relaxed font-medium">
                {notificationsText.pageDescription}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
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
                  <TooltipContent className="border-foreground bg-card text-foreground rounded-none border-2 text-[9px] font-black tracking-widest uppercase">
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
                  <TooltipContent className="border-foreground bg-card text-foreground rounded-none border-2 text-[9px] font-black tracking-widest uppercase">
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
                  <TooltipContent className="border-foreground bg-card text-foreground rounded-none border-2 text-[9px] font-black tracking-widest uppercase">
                    {notificationsText.clearAll}
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Telemetry Bar */}
      <div
        className="bg-border/40 border-border/40 mb-8 grid grid-cols-2 gap-px border sm:grid-cols-4"
        data-animate-stagger
      >
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
              <span className="text-muted-foreground/40 text-[10px] font-black tracking-widest uppercase">
                {stat.label}
              </span>
              <stat.icon className={cn("size-4", stat.color)} />
            </div>
            <div className="text-3xl font-black tracking-tighter">
              {digitsEnToFa(stat.value)}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-muted/5 border-border/40 border p-6">
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
    </PageTransition>
  );
}
