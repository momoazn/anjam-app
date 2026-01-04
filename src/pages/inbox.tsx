import { IconInbox } from "@tabler/icons-react";
import { subDays } from "date-fns";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { TaskListSkeleton } from "@/components/skeletons/task-list-skeleton";
import { TaskListItem } from "@/components/task/task-list-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyStateNoTasks } from "@/components/ui/empty-state";
import { inbox } from "@/constants";
import { useMentions } from "@/hooks/mentions";
import { useTasks } from "@/hooks/tasks";
import type { TaskWithProject } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store/auth-store";

type FilterOption = "all" | "active" | "done";

export default function Inbox() {
  const user = useAuthUser();
  const userId = user?.id;
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state from URL or default to 'all'
  const currentFilter = (searchParams.get("filter") as FilterOption) || "all";

  // Fetch all tasks where user is assignee or creator
  const { data: allTasks, isLoading } = useTasks({
    filter: userId
      ? `assignee = "${userId}" || created_by = "${userId}"`
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
              (t.assignee === userId ||
                (t as TaskWithProject & { created_by?: string }).created_by ===
                  userId),
          )
          .slice(0, 10) as TaskWithProject[],
      ),
    };
  }, [allTasks, userId, mentions, currentFilter]);

  // Loading state
  if (isLoading) {
    return (
      <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
        <PageHeader
          title={inbox.title}
          subtitle={inbox.description}
          icon={IconInbox}
        />
        <TaskListSkeleton count={5} />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
      <PageHeader
        title={inbox.title}
        subtitle={inbox.description}
        icon={IconInbox}
      />

      {/* Filter Chips */}
      <div className="mb-6 flex items-center gap-2">
        <Button
          variant={currentFilter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
          className={cn("rounded-full", currentFilter === "all" && "shadow-sm")}
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
              <EmptyStateNoTasks
                onCreate={() => {
                  // Navigate to task creation - this would need useNavigate
                  window.location.href = "/tasks/new";
                }}
              />
            ) : (
              <div className="space-y-2">
                {sections.assigned.map((task) => (
                  <TaskListItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mentioned Section (v1: placeholder) */}
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
    </PageTransition>
  );
}
