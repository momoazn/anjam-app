import { CheckSquare, LayoutGrid, ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { common, tasks } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

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
  const description =
    totalTasks > 0
      ? tasks.header.tasksFound.replace(
          "{count}",
          digitsEnToFa(totalTasks).toString(),
        )
      : tasks.header.manageTasks;

  return (
    <PageHeader
      title={tasks.allTasks}
      description={description}
      icon={ListTodo}
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-muted/30 flex items-center gap-1 rounded-2xl p-1.5">
            <Button
              variant="ghost"
              size="lg"
              onClick={onNavigateBoard}
              className="hover:bg-background h-12 gap-2 rounded-xl px-5 font-bold transition-all"
            >
              <LayoutGrid className="size-4" />
              <span className="text-sm">{tasks.board.title}</span>
            </Button>

            <div className="bg-border/40 mx-1 h-6 w-px" />

            <Button
              variant="ghost"
              size="lg"
              onClick={onToggleSelection}
              className={cn(
                "h-12 gap-2 rounded-xl px-5 font-bold transition-all",
                selectionMode &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              <CheckSquare className="size-4" />
              <span className="text-sm">
                {selectionMode
                  ? common.buttons.cancelSelection
                  : common.buttons.multiSelect}
              </span>
            </Button>
          </div>

          <Button
            className="h-14 gap-3 rounded-2xl px-8 text-base font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            size="lg"
            onClick={onCreateTask}
          >
            <Plus className="size-5" />
            <span>{tasks.addTask.buttons.newTask}</span>
          </Button>
        </div>
      }
    />
  );
}
