import { useMemo } from "react";
import { subDays } from "date-fns";
import { PageTransition } from "@/components/page-transition";
import { TaskListItem } from "@/components/task/task-list-item";
import { useTasks } from "@/hooks/tasks";
import { useAuthUser } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyStateNoTasks } from "@/components/ui/empty-state";
import { IconInbox } from "@tabler/icons-react";
import { TaskWithProject } from "@/lib/pocketbase";

/**
 * Inbox Page - Product Mode
 *
 * Multi-section interface for task prioritization:
 * 1. Assigned to me (open tasks)
 * 2. Mentioned (from notifications)
 * 3. Recently updated (last 7 days, user is participant)
 *
 * This is the primary entry point for product mode users.
 */
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

      // Section 2: Mentioned (requires mention tracking)
      // For v1: placeholder, will be populated from notifications table
      // TODO: Connect to notification system for @mentions
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
            Loading inbox...
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto space-y-6 p-6">
        {/* Page Header */}
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <IconInbox className="h-8 w-8" />
            Inbox
          </h1>
          <p className="text-muted-foreground mt-2">
            Stay on top of your tasks and updates
          </p>
        </div>

        <div className="space-y-6">
          {/* Assigned to me Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Assigned to me ({sections.assigned.length})
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
          {sections.mentioned.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Mentioned ({sections.mentioned.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sections.mentioned.map((task) => (
                    <TaskListItem key={task.id} task={task} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recently Updated Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Recently updated ({sections.recentlyUpdated.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sections.recentlyUpdated.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No recent updates in the last 7 days
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
      </div>
    </PageTransition>
  );
}
