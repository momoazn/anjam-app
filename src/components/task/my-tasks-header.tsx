import { Plus, User, CheckSquare, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  common,
  myTasks as myTasksText,
  navigationLabels,
  tasks,
  app,
} from "@/constants";
import { cn } from "@/lib/utils";

type MyTasksHeaderProps = {
  selectionMode: boolean;
  onToggleSelection: () => void;
  onCreateTask: () => void;
};

export function MyTasksHeader({
  selectionMode,
  onToggleSelection,
  onCreateTask,
}: MyTasksHeaderProps) {
  return (
    <div className="bg-card relative mb-8 overflow-hidden rounded-3xl border p-8 shadow-md">
      {/* Blueprint Grid Background */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-5">
          <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl">
            <User className="size-7" />
          </div>
          <div>
            <div className="text-primary flex items-center gap-2">
              <Layers className="size-3" />
              <span className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
                {app.name} / {navigationLabels.workspace} /{" "}
                {navigationLabels.index}
              </span>
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
              {myTasksText.title}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed font-medium">
              {myTasksText.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectionMode ? "secondary" : "outline"}
            size="lg"
            onClick={onToggleSelection}
            className={cn(
              "border-primary/10 h-12 gap-3 rounded-xl px-6 font-bold transition-all",
              selectionMode && "bg-primary/10 text-primary border-primary/30",
            )}
          >
            <CheckSquare className="size-4" />
            {selectionMode
              ? common.buttons.cancelSelection
              : common.buttons.multiSelect}
          </Button>
          <Button
            className="shadow-primary/20 h-12 gap-3 rounded-xl px-6 font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
            size="lg"
            onClick={onCreateTask}
          >
            <Plus className="size-5" />
            {tasks.addTask.buttons.newTask}
          </Button>
        </div>
      </div>

      {/* Structural Accent */}
      <div className="bg-primary/20 absolute end-0 bottom-0 h-1 w-32" />
      <div className="bg-primary/20 absolute end-0 bottom-0 h-8 w-1" />
    </div>
  );
}
