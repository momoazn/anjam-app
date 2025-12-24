import { IconPencil, IconTrash, IconChevronRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { tasks } from "@/constants";
import { formatTaskDate } from "@/lib/date-utils";
import {
  getStatusColorVariant,
  priorityColors,
  priorityIcons,
  taskStatusIcons,
} from "@/lib/status-utils";
import { formatUserName } from "@/lib/utils";
import type { TaskWithProject } from "@/lib/pocketbase";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { cn } from "@/lib/utils";

export type TaskDetailsHeaderProps = {
  task: TaskWithProject;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
};

export function TaskDetailsHeader({
  task,
  onBack,
  onEdit,
  onDelete,
  isDeleting,
}: TaskDetailsHeaderProps) {
  const StatusIcon = taskStatusIcons[task.status];
  const PriorityIcon = priorityIcons[task.priority];

  const headerActions = (
    <div className="flex flex-wrap gap-2">
      <div className="bg-muted/20 border-border/40 flex items-center gap-2 border p-1">
        <Badge
          variant="outline"
          className={cn(
            "rounded-none border-transparent text-[10px] font-black tracking-widest uppercase",
            getStatusColorVariant(task.status, "badge"),
          )}
        >
          <StatusIcon className="ms-1.5 h-3.5 w-3.5" />
          {tasks.status[task.status]}
        </Badge>

        <div className="bg-border/40 mx-1 h-4 w-px" />

        <Badge
          variant="outline"
          className={cn(
            "rounded-none border-transparent text-[10px] font-black tracking-widest uppercase",
            priorityColors[task.priority],
          )}
        >
          <PriorityIcon className="ms-1.5 h-3.5 w-3.5" />
          {tasks.priority[task.priority]}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onEdit}
          className="border-foreground bg-card h-12 rounded-none border-2 px-6 text-[10px] font-black tracking-widest uppercase shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none dark:shadow-[-4px_4px_0px_0px_rgba(255,255,255,0.05)]"
        >
          <IconPencil className="ms-2 size-4" />
          {tasks.details.editButton}
        </Button>

        <Button
          variant="ghost"
          onClick={onDelete}
          disabled={isDeleting}
          className="h-12 rounded-none px-6 text-[10px] font-black tracking-widest text-rose-500 uppercase hover:bg-rose-500/10"
        >
          <IconTrash className="ms-2 size-4" />
          {isDeleting
            ? tasks.details.buttons.deleting
            : tasks.details.buttons.delete}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="group text-muted-foreground/40 hover:text-primary gap-2 p-0 text-[10px] font-black tracking-[0.3em] uppercase transition-all"
      >
        <IconChevronRight className="size-3" />
        Back_To_Registry
      </Button>

      <PageHeader
        title={task.title}
        description={
          task.expand?.creator
            ? `Registry entry authorized by ${formatUserName(task.expand.creator.first_name, task.expand.creator.last_name, task.expand.creator.username)} on ${digitsEnToFa(formatTaskDate(task.created))}`
            : `Registry entry initiated on ${digitsEnToFa(formatTaskDate(task.created))}`
        }
        icon={StatusIcon}
        nodeId={`Task_Record :: ${task.display_id || task.id.slice(0, 8)}`}
        actions={headerActions}
      />
    </div>
  );
}
