import { CheckSquare, LayoutGrid, ListTodo, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { common, tasks } from "@/constants";

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
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
          <ListTodo className="h-5 w-5 md:h-6 md:w-6" />
          {tasks.allTasks}
        </h1>
        <p className="text-muted-foreground mt-2">
          {totalTasks > 0
            ? tasks.header.tasksFound.replace("{count}", totalTasks.toString())
            : tasks.header.manageTasks}
        </p>
      </div>
      <div className="flex w-full gap-2 sm:w-auto">
        <Button
          variant="outline"
          size="lg"
          onClick={onNavigateBoard}
          className="gap-2"
        >
          <LayoutGrid className="h-4 w-4" />
          {tasks.board.title}
        </Button>
        <Button
          variant={selectionMode ? "secondary" : "outline"}
          size="lg"
          onClick={onToggleSelection}
          className="gap-2"
        >
          <CheckSquare className="h-4 w-4" />
          {selectionMode
            ? common.buttons.cancelSelection
            : common.buttons.multiSelect}
        </Button>
        <Button
          className="w-full gap-2 sm:w-auto"
          size="lg"
          onClick={onCreateTask}
        >
          <Plus className="h-4 w-4" />
          {tasks.addTask.buttons.newTask}
        </Button>
      </div>
    </div>
  );
}
