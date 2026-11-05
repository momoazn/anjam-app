import { IconCalendar } from "@tabler/icons-react";
import { toast } from "sonner";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { tasks as tasksText } from "@/constants";
import { useTags } from "@/hooks/tags";
import { useUpdateTask } from "@/hooks/tasks";
import { dueToneClasses, getDueInfo } from "@/lib/due-date";
import { handleError } from "@/lib/error-handler";
import {
  isTaskCanceled,
  isTaskCompleted,
  priorityColors,
  priorityIcons,
} from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { TaskPriority, TaskWithProject } from "@/types/tasks";

/** Priority as icon + Persian label, colored by level (no box). */
export function TaskPriorityLabel({
  priority,
  className,
  iconOnly = false,
}: {
  priority: string;
  className?: string;
  iconOnly?: boolean;
}) {
  const key = priority as TaskPriority;
  const Icon = priorityIcons[key];
  if (!Icon) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        priorityColors[key],
        className,
      )}
      title={tasksText.priority[key]}
    >
      <Icon className="size-3.5 shrink-0" />
      {!iconOnly && <span>{tasksText.priority[key]}</span>}
    </span>
  );
}

/** One tag: a colored dot plus its name. */
export function TagChip({ name, color }: { name: string; color?: string }) {
  return (
    <span className="border-border/60 text-muted-foreground inline-flex items-center gap-1 rounded-md border px-1.5 py-0 text-[11px] leading-5">
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
}

/**
 * Tag chips resolved by id. While tags load we show a skeleton, and unknown
 * ids render nothing so a raw Convex id never reaches the UI.
 */
export function TaskTags({
  tagIds,
  max = 3,
  className,
}: {
  tagIds?: string[];
  max?: number;
  className?: string;
}) {
  const { data: tags, isLoading } = useTags();
  if (!tagIds || tagIds.length === 0) return null;

  if (isLoading) {
    return (
      <div className={cn("flex gap-1", className)}>
        <Skeleton className="h-4 w-12 rounded-md" />
      </div>
    );
  }

  const resolved = tagIds
    .map((id) => tags?.find((tag) => tag._id === id))
    .filter((tag): tag is NonNullable<typeof tag> => !!tag);
  if (resolved.length === 0) return null;

  const visible = resolved.slice(0, max);
  const hidden = resolved.length - visible.length;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {visible.map((tag) => (
        <TagChip key={tag._id} name={tag.name} color={tag.color} />
      ))}
      {hidden > 0 && (
        <span className="text-muted-foreground text-[11px]">+{hidden}</span>
      )}
    </div>
  );
}

/** Relative due date (overdue in red) that opens a calendar to change it. */
export function TaskDueDate({
  task,
  className,
}: {
  task: TaskWithProject;
  className?: string;
}) {
  const updateTask = useUpdateTask();
  if (!task.deadline) return null;

  const finished = isTaskCompleted(task) || isTaskCanceled(task);
  const { label, tone } = getDueInfo(task.deadline, { finished });

  const handleChange = (date: Date | undefined) => {
    updateTask
      .mutate({
        id: task._id,
        updates: { deadline: date ? date.getTime() : null },
      })
      .then(() => toast.success(tasksText.edit.success))
      .catch(handleError);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "hover:bg-muted/60 inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
            dueToneClasses[tone],
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <IconCalendar className="size-3.5 shrink-0" />
          <span className="whitespace-nowrap">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          selected={new Date(task.deadline)}
          onSelect={handleChange}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
