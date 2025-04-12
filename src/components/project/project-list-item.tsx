import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectsResponse } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";

// Helper to format date like "Apr 11"
const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fa-IR", {
    month: "numeric",
    day: "numeric",
  });
};

interface ProjectListItemProps {
  project: ProjectsResponse;
  onEdit?: (project: ProjectsResponse) => void;
  onDelete?: (project: ProjectsResponse) => void;
  isSupervisor?: boolean;
  className?: string;
}

export function ProjectListItem({
  project,
  onEdit,
  onDelete,
  isSupervisor,
  className,
}: ProjectListItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between px-2 py-1.5 transition-colors duration-200 ease-in-out hover:bg-gray-50/80",
        className,
      )}
    >
      {/* Left side: Code, Name */}
      <div className="flex min-w-0 flex-grow items-center gap-2">
        <span className="w-16 flex-shrink-0 font-mono text-xs text-gray-400 transition-colors duration-200 ease-in-out group-hover:text-gray-600">
          {project.code}
        </span>
        <span className="flex-grow truncate text-sm text-gray-800" title={project.name}>
          {project.name}
        </span>
      </div>

      {/* Right side: Date, Actions */}
      <div className="flex flex-shrink-0 items-center gap-3">
        {/* Date */}
        <span className="w-[50px] flex-shrink-0 text-right text-xs text-gray-500">
          {formatDateShort(project.created)}
        </span>

        {/* Actions */}
        {isSupervisor ? (
          <div className="flex w-[52px] items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => onEdit?.(project)}
            >
              <Pencil className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => onDelete?.(project)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ) : (
          <div className="w-[52px]" />
        )}
      </div>
    </div>
  );
}
