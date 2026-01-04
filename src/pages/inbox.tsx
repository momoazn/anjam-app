import { IconInbox } from "@tabler/icons-react";
import { subDays } from "date-fns";
import { useMemo } from "react";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { TaskListItem } from "@/components/task/task-list-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyStateNoTasks } from "@/components/ui/empty-state";
import { inbox } from "@/constants";
import { useTasks } from "@/hooks/tasks";
import { TaskWithProject } from "@/lib/pocketbase";
import { useAuthUser } from "@/store/auth-store";

export default function Inbox() {
  const user = useAuthUser();
  const userId = user?.id;

  // Fetch all tasks where user is assignee or creator
  const { data: allTasks, isLoading } = useTasks({
    filter: userId
      ? `assignee = "${userId}" || created_by = "${userId}"`
      : undefined,
    expandFields: "project,assignee,creator,project.organization,status_ref",
    mode: "full",
  });

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

    return {
      // Section 1: Assigned to me (open tasks)
      // Filters: assignee = me AND status != done AND status != canceled
      assigned: tasks.filter(
        (t) =>
          t.assignee === userId &&
          t.status !== "done" &&
          t.status !== "canceled",
      ),

      mentioned: [] as TaskWithProject[],

      // Section 3: Recently updated (last 7 days)
      // Where user is participant: assignee, creator, or commenter
      recentlyUpdated: tasks
        .filter(
          (t) =>
            t.updated &&
            new Date(t.updated) >= sevenDaysAgo &&
            (t.assignee === userId ||
              (t as TaskWithProject & { created_by?: string }).created_by ===
                userId),
        )
        .slice(0, 10) as TaskWithProject[], // Limit to 10 most recent
    };
  }, [allTasks, userId]);

  // Loading state
  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex h-full items-center justify-center">
          <div className="text-muted-foreground animate-pulse">
            {inbox.loading}
          </div>
        </div>
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
