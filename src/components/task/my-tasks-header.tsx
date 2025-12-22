import { CheckSquare, Plus, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { common, myTasks as myTasksText, tasks } from "@/constants";

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
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
          <User className="h-5 w-5 md:h-6 md:w-6" />
          {myTasksText.title}
        </h1>
        <p className="text-muted-foreground mt-2">{myTasksText.description}</p>
      </div>

      <div className="flex gap-2">
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
        <Button className="gap-2" size="lg" onClick={onCreateTask}>
          <Plus className="h-4 w-4" />
          {tasks.addTask.buttons.newTask}
        </Button>
      </div>
    </div>
  );
}
