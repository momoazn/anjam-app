import { Edit, Trash } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { DeleteProjectDialog } from "@/components/project/delete-project-dialog";
import { Button } from "@/components/ui/button";
import { ProjectsResponse } from "@/lib/pocketbase-types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { TEXT } from "@/constants/text";

interface ProjectListGroupProps {
  projects: ProjectsResponse[];
  onEdit: (project: ProjectsResponse) => void;
  isSupervisor: boolean;
}

export function ProjectListGroup({
  projects,
  onEdit,
  isSupervisor,
}: ProjectListGroupProps) {
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectsResponse | null>(null);

  const handleDelete = (project: ProjectsResponse) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        {projects.map((project) => (
          <TooltipProvider key={project.id}>
            <Tooltip>
              <TooltipContent>{TEXT.projects.list.viewTasks}</TooltipContent>
              <TooltipTrigger asChild>
                <div
                  key={project.id}
                  className="flex items-center justify-between border-b p-4 last:border-0 hover:bg-gray-50"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/projects/${project.id}/tasks`)}
                  >
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.code}</p>
                  </div>

                  {isSupervisor && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(project)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => handleDelete(project)}
                      >
                        <Trash className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      <DeleteProjectDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        project={selectedProject}
      />
    </>
  );
}
