import { digitsEnToFa } from "@persian-tools/persian-tools";
import { CheckSquare, LayoutGrid, ListTodo, Plus } from "lucide-react";

import { Toolbar, ToolbarSeparator } from "@/components/recipes/toolbar";
import { Button } from "@/components/ui/button";
import { IconBox } from "@/components/ui/icon-box";
import { common, system, tasks } from "@/constants";
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
  return (
    <div className="relative mb-6 flex flex-col gap-6 border-b pb-6 md:flex-row md:items-end md:justify-between">
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <IconBox size="lg" tone="primary">
            <ListTodo className="size-full p-1" />
          </IconBox>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 opacity-40">
              <span className="font-mono text-[10px] font-bold tracking-tight">
                {system.registry}
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
        <Toolbar className="gap-1">
          <Button
            variant="ghost"
            size="lg"
            onClick={onNavigateBoard}
            className="hover:bg-background h-12 gap-2 rounded-xl px-5 font-bold transition-all"
          >
            <LayoutGrid className="size-4" />
            <span className="text-sm">{tasks.board.title}</span>
          </Button>

          <ToolbarSeparator className="bg-border/40 mx-1 h-6 w-px" />

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
        </Toolbar>

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
