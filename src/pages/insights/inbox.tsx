import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  type Icon,
  IconAt,
  IconChevronDown,
  IconHistory,
  IconInbox,
  IconListCheck,
} from "@tabler/icons-react";
import { subDays } from "date-fns";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { TaskListItem } from "@/components/task/list/task-list-item";
import { TaskListSkeleton } from "@/components/task/list/task-list-skeleton";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { inbox } from "@/constants";
import { useMentions } from "@/hooks/mentions";
import { useTasks } from "@/hooks/tasks";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store/app-context-store";
import { useOpenModal } from "@/store/modal-store";
import { TaskWithDetails } from "@/types/tasks";

type FilterOption = "all" | "active" | "done";

function SectionHeader({
  title,
  count,
  icon: Icon,
  isCollapsible = false,
  isOpen = true,
  onToggle,
}: {
  title: string;
  count: number;
  icon: Icon;
  isCollapsible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const content = (
    <>
      <Icon className="text-muted-foreground size-4" />
      <span className="text-sm font-semibold">{title}</span>
      <span className="bg-muted text-muted-foreground rounded-full px-2 text-xs tabular-nums">
        {digitsEnToFa(count)}
      </span>
      {isCollapsible && (
        <IconChevronDown
          className={cn(
            "text-muted-foreground ms-auto size-4 transition-transform",
            !isOpen && "rotate-90",
          )}
        />
      )}
    </>
  );
  const className =
    "border-border/40 bg-muted/10 flex items-center gap-2 border-b px-3 py-2";
  return isCollapsible ? (
    <button
      type="button"
      aria-expanded={isOpen}
      className={cn(
        className,
        "hover:bg-muted/30 w-full cursor-pointer text-right transition-colors",
      )}
      onClick={onToggle}
    >
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}

function InlineEmptyState({
  title,
  icon: Icon,
}: {
  title: string;
  icon: Icon;
}) {
  return (
    <div className="text-muted-foreground flex items-center gap-3 px-3 py-5 text-sm">
      <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full">
        <Icon className="size-4" />
      </span>
      {title}
    </div>
  );
}

function TaskRows({ tasks }: { tasks: TaskWithDetails[] }) {
  return (
    <ul className="divide-border/40 divide-y">
      {tasks.map((task) => (
        <li key={task._id}>
          <TaskListItem task={task} showProject />
        </li>
      ))}
    </ul>
  );
}

export default function Inbox() {
  const openModal = useOpenModal();
  const user = useAuthUser();
  const userId = user?._id;
  const [searchParams, setSearchParams] = useSearchParams();
  // null = follow the content: open when there are recent updates
  const [recentlyOverride, setRecentlyOverride] = useState<boolean | null>(
    null,
  );

  // Filter state from URL or default to 'all'
  const currentFilter = (searchParams.get("filter") as FilterOption) || "all";

  // Fetch all tasks for the organization
  const { data: allTasks, isLoading } = useTasks({
    enabled: !!userId,
    perPage: 100, // Fetch more for local filtering in inbox
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
        assigned: [] as TaskWithDetails[],
        mentioned: [] as TaskWithDetails[],
        recentlyUpdated: [] as TaskWithDetails[],
      };
    }

    const tasks = allTasks.items;
    const sevenDaysAgo = subDays(new Date(), 7);

    // Section 2: Mentioned in comments
    // Get unique tasks from mentions, excluding those already in assigned
    const mentionedTaskIds = new Set(
      mentions?.map((m) => m.expand?.task?._id).filter(Boolean) as string[],
    );
    const mentionedTasks = Array.from(mentionedTaskIds)
      .map((taskId) => tasks.find((t) => t._id === taskId))
      .filter((t): t is TaskWithDetails => Boolean(t));

    // Filter functions
    const isActive = (t: TaskWithDetails) =>
      t.status !== "done" && t.status !== "cancelled";
    const isDone = (t: TaskWithDetails) =>
      t.status === "done" || t.status === "cancelled";

    // Apply current filter
    const filterTasks = (tasks: TaskWithDetails[]) => {
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
      assigned: filterTasks(tasks.filter((t) => t.assigneeUserId === userId)),

      // Section 2: Mentioned in comments
      mentioned: filterTasks(mentionedTasks),

      // Section 3: Recently updated (last 7 days)
      // Where user is participant: assignee, creator, or commenter
      recentlyUpdated: filterTasks(
        tasks
          .filter(
            (t) =>
              t.updatedAt &&
              new Date(t.updatedAt) >= sevenDaysAgo &&
              (t.assigneeUserId === userId || t.creatorUserId === userId),
          )
          .slice(0, 10) as TaskWithDetails[],
      ),
    };
  }, [allTasks, userId, mentions, currentFilter]);

  const totalCount =
    sections.assigned.length +
    sections.mentioned.length +
    sections.recentlyUpdated.length;

  const recentlyOpen = recentlyOverride ?? sections.recentlyUpdated.length > 0;

  return (
    <PageTransition
      data-testid="inbox-page"
      className="container mx-auto max-w-7xl p-4 md:p-6"
    >
      <PageHeader
        title={inbox.title}
        subtitle={
          !isLoading && totalCount === 0 ? inbox.description : undefined
        }
        icon={IconInbox}
      />

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
            {inbox.buttons.all}
          </ToggleGroupItem>
          <ToggleGroupItem value="active" className="h-8 px-3 text-xs">
            {inbox.buttons.active}
          </ToggleGroupItem>
          <ToggleGroupItem value="done" className="h-8 px-3 text-xs">
            {inbox.buttons.done}
          </ToggleGroupItem>
        </ToggleGroup>

        <Button
          size="sm"
          className="h-8 px-3"
          onClick={() => openModal("create-task")}
        >
          {inbox.createTask}
        </Button>
      </div>

      {isLoading ? (
        <TaskListSkeleton />
      ) : (
        <div className="border-border/40 bg-background/30 divide-border/40 divide-y overflow-hidden rounded-xl border">
          <section>
            <SectionHeader
              title={inbox.sections.assigned}
              count={sections.assigned.length}
              icon={IconListCheck}
            />
            {sections.assigned.length === 0 ? (
              <InlineEmptyState title={inbox.noTodos} icon={IconListCheck} />
            ) : (
              <TaskRows tasks={sections.assigned} />
            )}
          </section>

          <section>
            <SectionHeader
              title={inbox.sections.mentioned}
              count={sections.mentioned.length}
              icon={IconAt}
            />
            {sections.mentioned.length === 0 ? (
              <InlineEmptyState title={inbox.noMentions} icon={IconAt} />
            ) : (
              <TaskRows tasks={sections.mentioned} />
            )}
          </section>

          <section>
            <SectionHeader
              title={inbox.sections.recentlyUpdated}
              count={sections.recentlyUpdated.length}
              icon={IconHistory}
              isCollapsible
              isOpen={recentlyOpen}
              onToggle={() => setRecentlyOverride(!recentlyOpen)}
            />
            {recentlyOpen &&
              (sections.recentlyUpdated.length === 0 ? (
                <InlineEmptyState
                  title={inbox.noRecentUpdates}
                  icon={IconHistory}
                />
              ) : (
                <TaskRows tasks={sections.recentlyUpdated} />
              ))}
          </section>
        </div>
      )}
    </PageTransition>
  );
}
