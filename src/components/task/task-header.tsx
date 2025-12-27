import { CheckSquare, LayoutGrid, ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { common, tasks } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { cn } from "@/lib/utils";
import { BlueprintPattern } from "@/components/design-system/blueprint-pattern";

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
  return (
    <div className="relative mb-12 flex flex-col gap-8 border-b pb-12 md:flex-row md:items-end md:justify-between">
      <BlueprintPattern variant="technical" className="opacity-[0.03]" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-2xl">
            <ListTodo className="size-8" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 opacity-40">
              <span className="font-mono text-[10px] font-bold tracking-tight">
                System Registry
              </span>
              <div className="bg-foreground/20 h-px w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {tasks.allTasks}
            </h1>
          </div>
        </div>

        <p className="text-muted-foreground/60 max-w-md text-sm leading-relaxed font-medium">
          {totalTasks > 0
            ? tasks.header.tasksFound.replace(
                "{count}",
                digitsEnToFa(totalTasks).toString(),
              )
            : tasks.header.manageTasks}
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap items-center gap-3">
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
    </div>
  );
}
