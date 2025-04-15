import { IconUsers } from "@tabler/icons-react";
import { Edit, Trash } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { DeleteProjectDialog } from "@/components/project/delete-project-dialog";
import { Button } from "@/components/ui/button";
import { TEXT } from "@/constants/text";
import { ProjectsResponse } from "@/lib/pocketbase-types";

interface ProjectListGroupProps {
  projects: ProjectsResponse[];
  onEdit: (project: ProjectsResponse) => void;
  canEditDelete: boolean;
}

export function ProjectListGroup({
  projects,
  onEdit,
  canEditDelete,
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
          <div
            key={project.id}
            className="flex items-center justify-between border-b p-4 last:border-0 hover:bg-gray-50"
          >
            <div
              className="flex-1 cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}/tasks`)}
            >
              <h3 className="font-medium">{project.name}</h3>
              <p className="text-muted-foreground text-sm">{project.code}</p>
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate(`/projects/${project.id}/tasks`)}
            >
              {TEXT.projects.list.viewTasks}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/projects/${project.id}/users`)}
            >
              <IconUsers />
            </Button>
            {canEditDelete && (
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
                  className="text-destructive"
                  onClick={() => handleDelete(project)}
                >
                  <Trash className="size-4" />
                </Button>
              </div>
            )}
          </div>
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
