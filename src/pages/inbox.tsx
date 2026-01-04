import { IconInbox } from "@tabler/icons-react";
import { subDays } from "date-fns";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { TaskListSkeleton } from "@/components/skeletons/task-list-skeleton";
import { TaskListItem } from "@/components/task/task-list-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyStateNoTasks } from "@/components/ui/empty-state";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { inbox } from "@/constants";
import { useMentions } from "@/hooks/mentions";
import { useTasks } from "@/hooks/tasks";
import type { TaskWithProject } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";
import { useAuthUser, useCurrentOrgMode } from "@/store/auth-store";

type FilterOption = "all" | "active" | "done";

function SectionHeader({
  title,
  count,
  isCollapsible = false,
  isOpen = true,
  onToggle,
}: {
  title: string;
  count: number;
  isCollapsible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 bg-muted/10 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {count}
        </span>
      </div>
      {isCollapsible ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={onToggle}
        >
          {isOpen ? "بستن" : "باز کردن"}
        </Button>
      ) : null}
    </div>
  );
}

function InlineEmptyState({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border/40 px-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm">{title}</p>
      {actionLabel && onAction ? (
        <Button size="sm" className="h-8 px-3" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default function Inbox() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const userId = user?.id;
  const currentOrgMode = useCurrentOrgMode();
  const isProductMode = currentOrgMode === "product";
  const [searchParams, setSearchParams] = useSearchParams();
  const [recentlyOpen, setRecentlyOpen] = useState(false);

  // Filter state from URL or default to 'all'
  const currentFilter = (searchParams.get("filter") as FilterOption) || "all";

  // Fetch all tasks where user is assignee or creator
  const { data: allTasks, isLoading } = useTasks({
    filter: userId
      ? `assignee = "${userId}" || creator = "${userId}"`
      : undefined,
    expandFields: "project,assignee,creator,project.organization,status_ref",
    mode: "full",
  });

  // Fetch mentions for the current user
  const { data: mentions } = useMentions();

  // Set filter
  const setFilter = (filter: FilterOption) => {
    setSearchParams((prev) => {
      if (filter === "all") {
        prev.delete("filter");
      } else {
        prev.set("filter", filter);
      }
      return prev;
    });
  };

  // Organize tasks into sections
  const sections = useMemo(() => {
    if (!allTasks?.items || !userId) {
      return {
        assigned: [] as TaskWithProject[],
        mentioned: [] as TaskWithProject[],
        recentlyUpdated: [] as TaskWithProject[],
      };
    }

    const tasks = allTasks.items;
    const sevenDaysAgo = subDays(new Date(), 7);

    // Section 2: Mentioned in comments
    // Get unique tasks from mentions, excluding those already in assigned
    const mentionedTaskIds = new Set(
      mentions?.map((m) => m.expand?.task?.id).filter(Boolean) as string[],
    );
    const mentionedTasks = Array.from(mentionedTaskIds)
      .map((taskId) => tasks.find((t) => t.id === taskId))
      .filter((t): t is TaskWithProject => Boolean(t));

    // Filter functions
    const isActive = (t: TaskWithProject) =>
      t.status !== "done" && t.status !== "canceled";
    const isDone = (t: TaskWithProject) =>
      t.status === "done" || t.status === "canceled";

    // Apply current filter
    const filterTasks = (tasks: TaskWithProject[]) => {
      switch (currentFilter) {
        case "active":
          return tasks.filter(isActive);
        case "done":
          return tasks.filter(isDone);
        default:
          return tasks;
      }
    };

    return {
      // Section 1: Assigned to me
      assigned: filterTasks(tasks.filter((t) => t.assignee === userId)),

      // Section 2: Mentioned in comments
      mentioned: filterTasks(mentionedTasks),

      // Section 3: Recently updated (last 7 days)
      // Where user is participant: assignee, creator, or commenter
      recentlyUpdated: filterTasks(
        tasks
          .filter(
            (t) =>
              t.updated &&
              new Date(t.updated) >= sevenDaysAgo &&
              (t.assignee === userId || t.creator === userId),
          )
          .slice(0, 10) as TaskWithProject[],
      ),
    };
  }, [allTasks, userId, mentions, currentFilter]);

  const totalCount =
    sections.assigned.length +
    sections.mentioned.length +
    sections.recentlyUpdated.length;

  // Loading state
  if (isLoading) {
    return (
      <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
        <PageHeader
          title={inbox.title}
          icon={IconInbox}
          subtitle={
            isProductMode
              ? totalCount === 0
                ? inbox.description
                : undefined
              : inbox.description
          }
        />
        {isProductMode ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <ToggleGroup
                type="single"
                value={currentFilter}
                onValueChange={(value) => {
                  if (!value) return;
                  setFilter(value as FilterOption);
                }}
                className="justify-start"
              >
                <ToggleGroupItem value="all" className="h-8 px-3 text-xs">
                  همه
                </ToggleGroupItem>
                <ToggleGroupItem value="active" className="h-8 px-3 text-xs">
                  فعال
                </ToggleGroupItem>
                <ToggleGroupItem value="done" className="h-8 px-3 text-xs">
                  انجام‌شده
                </ToggleGroupItem>
              </ToggleGroup>
              <Button
                size="sm"
                className="h-8 px-3"
                onClick={() => navigate("/tasks/new")}
              >
                ساخت تسک
              </Button>
            </div>
            <div className="mt-4">
              <TaskListSkeleton count={6} />
            </div>
          </>
        ) : (
          <TaskListSkeleton count={5} />
        )}
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
      <PageHeader
        title={inbox.title}
        subtitle={
          isProductMode
            ? totalCount === 0
              ? inbox.description
              : undefined
            : inbox.description
        }
        icon={IconInbox}
      />

      {isProductMode ? (
        <>
          {/* Compact toolbar */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ToggleGroup
              type="single"
              value={currentFilter}
              onValueChange={(value) => {
                if (!value) return;
                setFilter(value as FilterOption);
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="all" className="h-8 px-3 text-xs">
                همه
              </ToggleGroupItem>
              <ToggleGroupItem value="active" className="h-8 px-3 text-xs">
                فعال
              </ToggleGroupItem>
              <ToggleGroupItem value="done" className="h-8 px-3 text-xs">
                انجام‌شده
              </ToggleGroupItem>
            </ToggleGroup>

            <Button
              size="sm"
              className="h-8 px-3"
              onClick={() => navigate("/tasks/new")}
            >
              ساخت تسک
            </Button>
          </div>

          {/* Single compact surface (Linear-like) */}
          <div
            className={cn(
              "overflow-hidden rounded-xl border border-border/40",
              "bg-background/30",
            )}
          >
            {/* Assigned */}
            <SectionHeader
              title={inbox.sections.assigned}
              count={sections.assigned.length}
            />
            {sections.assigned.length === 0 ? (
              <InlineEmptyState
                title="چیزی برای انجام ندارید"
                actionLabel="ساخت تسک"
                onAction={() => navigate("/tasks/new")}
              />
            ) : (
              sections.assigned.map((task) => (
                <TaskListItem key={task.id} task={task} showProject />
              ))
            )}

            {/* Mentioned */}
            <SectionHeader
              title={inbox.sections.mentioned}
              count={sections.mentioned.length}
            />
            {sections.mentioned.length === 0 ? (
              <InlineEmptyState title="هنوز اشاره‌ای ندارید" />
            ) : (
              sections.mentioned.map((task) => (
                <TaskListItem key={task.id} task={task} showProject />
              ))
            )}

            {/* Recently updated (collapsed by default) */}
            <SectionHeader
              title={inbox.sections.recentlyUpdated}
              count={sections.recentlyUpdated.length}
              isCollapsible
              isOpen={recentlyOpen}
              onToggle={() => setRecentlyOpen((v) => !v)}
            />
            {recentlyOpen ? (
              sections.recentlyUpdated.length === 0 ? (
                <InlineEmptyState title={inbox.noRecentUpdates} />
              ) : (
                sections.recentlyUpdated.map((task) => (
                  <TaskListItem key={task.id} task={task} showProject />
                ))
              )
            ) : (
              <div className="text-muted-foreground border-b border-border/40 px-3 py-3 text-xs">
                برای دیدن به‌روزرسانی‌های اخیر باز کنید
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Filter Chips */}
          <div className="mb-6 flex items-center gap-2">
            <Button
              variant={currentFilter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className={cn(
                "rounded-full",
                currentFilter === "all" && "shadow-sm",
              )}
            >
              همه
            </Button>
            <Button
              variant={currentFilter === "active" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("active")}
              className={cn(
                "rounded-full",
                currentFilter === "active" && "shadow-sm",
              )}
            >
              فعال
            </Button>
            <Button
              variant={currentFilter === "done" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("done")}
              className={cn(
                "rounded-full",
                currentFilter === "done" && "shadow-sm",
              )}
            >
              انجام‌شده
            </Button>
          </div>

          <div className="space-y-6">
            {/* Assigned to me Section */}
            <Card>
              <CardHeader className="text-right">
                <CardTitle className="text-lg">
                  {inbox.sections.assigned} ({sections.assigned.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sections.assigned.length === 0 ? (
                  <EmptyStateNoTasks onCreate={() => navigate("/tasks/new")} />
                ) : (
                  <div className="space-y-2">
                    {sections.assigned.map((task) => (
                      <TaskListItem key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mentioned Section */}
            <Card>
              <CardHeader className="text-right">
                <CardTitle className="text-lg">
                  {inbox.sections.mentioned} ({sections.mentioned.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sections.mentioned.length === 0 ? (
                  <div className="bg-muted/10 border-border/40 rounded-xl border border-dashed p-6 text-center">
                    <p className="text-muted-foreground text-[10px] font-bold tracking-tight">
                      {inbox.mentionedComingSoon}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sections.mentioned.map((task) => (
                      <TaskListItem key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recently Updated Section */}
            <Card>
              <CardHeader className="text-right">
                <CardTitle className="text-lg">
                  {inbox.sections.recentlyUpdated} (
                  {sections.recentlyUpdated.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sections.recentlyUpdated.length === 0 ? (
                  <p className="text-muted-foreground text-right text-sm">
                    {inbox.noRecentUpdates}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sections.recentlyUpdated.map((task) => (
                      <TaskListItem key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PageTransition>
  );
}
