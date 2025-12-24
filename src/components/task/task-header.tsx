import { CheckSquare, LayoutGrid, ListTodo, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { common, tasks } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { cn } from "@/lib/utils";

type TaskHeaderProps = {
  totalTasks: number;
  selectionMode: boolean;
  onToggleSelection: () => void;
  onNavigateBoard: () => void;
  onCreateTask: () => void;
};

export function TaskHeader({
  totalTasks,
  selectionMode,
  onToggleSelection,
  onNavigateBoard,
  onCreateTask,
}: TaskHeaderProps) {
  const headerActions = (
    <div className="flex flex-wrap gap-2">
      <div className="bg-muted/20 border-border/40 flex items-center gap-2 border p-1">
        <Button
          variant="ghost"
          size="lg"
          onClick={onNavigateBoard}
          className="hover:bg-primary/5 hover:text-primary h-12 gap-3 rounded-none px-6 font-bold transition-all"
        >
          <LayoutGrid className="size-4" />
          <span className="text-[11px] font-black tracking-widest uppercase">
            {tasks.board.title}
          </span>
        </Button>

        <div className="bg-border/40 h-6 w-px" />

        <Button
          variant="ghost"
          size="lg"
          onClick={onToggleSelection}
          className={cn(
            "h-12 gap-3 rounded-none px-6 font-bold transition-all",
            selectionMode && "bg-primary/10 text-primary",
          )}
        >
          <CheckSquare className="size-4" />
          <span className="text-[11px] font-black tracking-widest uppercase">
            {selectionMode
              ? common.buttons.cancelSelection
              : common.buttons.multiSelect}
          </span>
        </Button>
      </div>

      <Button
        className="h-14 gap-3 rounded-none px-8 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
        size="lg"
        onClick={onCreateTask}
      >
        <Plus className="size-5" />
        <span className="tracking-widest uppercase">
          {tasks.addTask.buttons.newTask}
        </span>
      </Button>
    </div>
  );

  return (
    <PageHeader
      title={tasks.allTasks}
      description={
        totalTasks > 0
          ? tasks.header.tasksFound.replace(
              "{count}",
              digitsEnToFa(totalTasks).toString(),
            )
          : tasks.header.manageTasks
      }
      icon={ListTodo}
      nodeId="Task_Registry"
      actions={headerActions}
    />
  );
}
