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
    <div className="border-foreground relative mb-12 flex flex-col gap-8 border-b-4 pb-12 md:flex-row md:items-end md:justify-between">
      <BlueprintPattern variant="technical" className="opacity-[0.03]" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-foreground text-background flex size-16 items-center justify-center">
            <ListTodo className="size-8" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 opacity-40">
              <span className="font-mono text-[10px] font-black tracking-[0.2em] uppercase">
                System_Registry
              </span>
              <div className="bg-foreground/20 h-px w-8" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase md:text-7xl">
              {tasks.allTasks}
            </h1>
          </div>
        </div>

        <p className="text-muted-foreground/60 max-w-md text-sm leading-relaxed font-bold tracking-tight uppercase">
          {totalTasks > 0
            ? tasks.header.tasksFound.replace(
                "{count}",
                digitsEnToFa(totalTasks).toString(),
              )
            : tasks.header.manageTasks}
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap items-center gap-3">
        <div className="bg-muted/20 border-border/40 flex border-2 p-1">
          <Button
            variant="ghost"
            size="lg"
            onClick={onNavigateBoard}
            className="hover:bg-primary/10 hover:text-primary h-14 gap-3 rounded-none px-6 font-black transition-all"
          >
            <LayoutGrid className="size-5" />
            <span className="text-[11px] tracking-widest uppercase">
              {tasks.board.title}
            </span>
          </Button>

          <div className="bg-border/40 mx-1 w-px" />

          <Button
            variant="ghost"
            size="lg"
            onClick={onToggleSelection}
            className={cn(
              "h-14 gap-3 rounded-none px-6 font-black transition-all",
              selectionMode &&
                "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            <CheckSquare className="size-5" />
            <span className="text-[11px] tracking-widest uppercase">
              {selectionMode
                ? common.buttons.cancelSelection
                : common.buttons.multiSelect}
            </span>
          </Button>
        </div>

        <Button
          className="h-16 gap-4 rounded-none px-10 text-lg font-black shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_rgba(0,0,0,0.15)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none"
          size="lg"
          onClick={onCreateTask}
        >
          <Plus className="size-6" />
          <span className="tracking-tighter uppercase">
            {tasks.addTask.buttons.newTask}
          </span>
        </Button>
      </div>
    </div>
  );
}
