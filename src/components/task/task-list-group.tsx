import {
  CheckCircle2, // Done
  Circle, // Canceled
  CircleDotDashed, // In Progress
  CircleHelp, // Default / Overdue
  Plus,
  XCircle, // Canceled
} from "lucide-react";
import React from "react";
import { TaskStatus } from "../../store/task-store";
import { Button } from "../ui/button"; // Import Button

interface TaskListGroupProps {
  statusTitle: string;
  taskCount: number; // Changed from tasks: Task[]
  status: TaskStatus; // Added status for icon logic
  children: React.ReactNode;
}

// Map status to icons
const statusIcons: Record<TaskStatus, React.ElementType> = {
  pending: Circle, // Todo
  in_progress: CircleDotDashed, // In Progress (using CircleDotDashed as approximation)
  completed: CheckCircle2, // Done
  canceled: XCircle, // Canceled
  overdue: CircleHelp, // Default for Overdue (not in image, but kept)
};

const statusColors: Record<TaskStatus, string> = {
  pending: "text-gray-400",
  in_progress: "text-yellow-500",
  completed: "text-purple-600",
  canceled: "text-gray-500",
  overdue: "text-gray-500",
};

export function TaskListGroup({
  statusTitle,
  taskCount,
  status,
  children,
}: TaskListGroupProps) {
  const IconComponent = statusIcons[status] || CircleHelp;

  return (
    <div className="mb-4">
      {" "}
      {/* Slightly reduced margin */}
      <div className="mb-2 flex items-center justify-between bg-gray-200 px-2 py-1">
        {" "}
        {/* Adjusted margin and padding */}
        <div className="flex items-center">
          <IconComponent
            className={`mr-2 h-3.5 w-3.5 ${statusColors[status]}`}
            strokeWidth={status === "pending" ? 1.5 : 2} // Thinner stroke for Todo icon
          />
          <h2 className="mr-2 text-sm font-medium text-gray-800">
            {" "}
            {/* Darker text */}
            {statusTitle}
          </h2>
          <span className="text-sm text-gray-400">{taskCount}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1 pl-1">{children}</div>{" "}
      {/* Added padding left */}
    </div>
  );
}
