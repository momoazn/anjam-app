import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  SignalLow,
  XCircle,
} from "lucide-react";
import { Task } from "../../store/task-store";
import { Badge } from "../ui/badge";

interface TaskListItemProps {
  task: Task;
}

// Helper to format date like "Apr 11"
const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Helper to get user initials
const getUserInitials = (username?: string) => {
  // Assuming assignedTo contains usernames like 'user-1'
  // If it contains full names, this logic needs adjustment
  return username
    ? username.substring(0, 2).toUpperCase() // Simple initials for 'user-X'
    : "?";
};

export function TaskListItem({ task }: TaskListItemProps) {
  // Use priority icon if available, otherwise default based on a tag or status
  // In the image, TSK-12 (In Progress) has a yellow ! which matches high priority/Bug
  // TSK-13 (Done) has a checkmark
  // TSK-14 (Canceled) has a gray !
  // Others (Canceled) have gray X

  let LeftIcon = SignalLow; // Default icon
  let iconColor = "text-gray-400";

  // Determine icon based on status first (like the image does)
  if (task.status === "in_progress") {
    LeftIcon = AlertCircle; // Yellow ! for In Progress TSK-12
    iconColor = "text-yellow-500";
  }
  if (task.status === "pending") {
    LeftIcon = Circle; // Empty circle for Todo
    iconColor = "text-gray-400";
  }
  if (task.status === "completed") {
    LeftIcon = CheckCircle2; // Checkmark for Done TSK-13
    iconColor = "text-purple-600";
  }
  if (task.status === "canceled") {
    // Image shows gray ! for TSK-14 and X for others
    LeftIcon = task.id === "TSK-14" ? AlertCircle : XCircle;
    iconColor = "text-gray-500";
  }

  // Override with priority icon if it makes sense (e.g., high priority bug)
  // if (task.priority === "high") {
  //   LeftIcon = priorityIcons[task.priority];
  //   iconColor = "text-red-500"; // High priority often red
  // }

  // Placeholder logic for assignee avatar - assuming single assignee for simplicity
  const assignee = task.assignedTo.length > 0 ? task.assignedTo[0] : undefined;

  return (
    <div className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded transition-colors duration-150 cursor-pointer group">
      {/* Left side: Icon, ID, Title */}
      <div className="flex items-center min-w-0 flex-grow mr-4">
        <LeftIcon
          className={`w-4 h-4 mr-2.5 flex-shrink-0 ${iconColor}`}
          strokeWidth={task.status === "pending" ? 1.5 : 2}
        />
        <span className="text-xs text-gray-400 mr-2 font-mono flex-shrink-0 group-hover:text-gray-600">
          {task.id}
        </span>
        <span className="text-sm text-gray-800 truncate" title={task.title}>
          {task.title}
        </span>
      </div>

      {/* Right side: Tags, Date, Assignee */}
      <div className="flex items-center flex-shrink-0 space-x-3">
        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="hidden md:flex items-center space-x-1">
            {task.tags.slice(0, 2).map((tag) => {
              // Limit tags shown
              // Simple color logic for tags
              let tagColor = "bg-gray-100 text-gray-600 border-gray-200";
              if (tag === "Bug")
                tagColor = "bg-red-100 text-red-700 border-red-200";
              if (tag === "Feature")
                tagColor = "bg-purple-100 text-purple-700 border-purple-200";
              if (tag === "Improvement")
                tagColor = "bg-blue-100 text-blue-700 border-blue-200";
              return (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`px-1.5 py-0.5 text-xs font-medium rounded ${tagColor}`}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Date */}
        <span className="text-xs text-gray-500 flex-shrink-0 w-[50px] text-right">
          {formatDateShort(task.deadline)}{" "}
          {/* Using deadline date from image */}
        </span>

        {/* Assignee Avatar */}
        <Avatar className="w-5 h-5">
          <AvatarImage
            src={`https://avatar.vercel.sh/${assignee}.png`}
            alt={assignee}
          />
          <AvatarFallback className="text-[10px] bg-gray-200">
            {getUserInitials(assignee)}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
