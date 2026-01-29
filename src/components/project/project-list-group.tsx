import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconHash } from "@tabler/icons-react";
import { Edit, FileText, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { DeleteProjectDialog } from "@/components/project/delete-project-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyStateNoProjects } from "@/components/ui/empty-state";
import { projects as projectsText } from "@/constants";
import { useTasks } from "@/hooks/tasks";

type ProjectListItem = {
  _id: string;
  name: string;
  code: string;
};

type ProjectListGroupProps = {
  projects: ProjectListItem[];
  onEdit: (projectId: string) => void;
  canEditDelete: boolean;
  canCreate?: boolean;
};

export function ProjectListGroup({
  projects,
  onEdit,
  canEditDelete,
  canCreate = false,
}: ProjectListGroupProps) {
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectListItem | null>(null);

  const { data: allTasksResult } = useTasks();
  const allTasks = allTasksResult?.items ?? [];

  const handleDelete = (project: ProjectListItem) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  const getProjectProgress = (projectId: string) => {
    const projectTasks = allTasks.filter(
      (task) => task.projectId === projectId,
    );
    const completedTasks = projectTasks.filter(
      (task) => task.status === "done",
    );

    return {
      total: projectTasks.length,
      completed: completedTasks.length,
      progress:
        projectTasks.length > 0
          ? Math.round((completedTasks.length / projectTasks.length) * 100)
          : 0,
    };
  };

  return (
    <>
      {projects.length === 0 ? (
        canCreate ? (
          <EmptyStateNoProjects onCreate={() => navigate("/projects/new")} />
        ) : (
          <EmptyStateNoProjects />
        )
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30">
          {projects.map((project) => {
            const progress = getProjectProgress(project._id);
            return (
              <div
                key={project._id}
                className="group border-b border-border/40 last:border-b-0"
              >
                <div
                  role="button"
                  tabIndex={0}
                  className="flex h-auto w-full cursor-pointer items-center justify-between gap-3 rounded-none px-4 py-3 text-right hover:bg-muted/30"
                  onClick={() => navigate(`/projects/${project._id}/tasks`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/projects/${project._id}/tasks`);
                    }
                  }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="min-w-0">
                      <div className="text-muted-foreground flex items-center gap-2">
                        <IconHash className="size-3" />
                        <span className="font-mono text-[10px] font-bold tracking-wider">
                          {project.code}
                        </span>
                        <span className="text-[10px] font-semibold opacity-70 tabular-nums">
                          {digitsEnToFa(progress.progress)}%
                        </span>
                      </div>
                      <div className="truncate text-sm font-semibold">
                        {project.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-muted-foreground hidden items-center gap-2 text-xs font-semibold tabular-nums sm:flex">
                      <span>
                        {digitsEnToFa(progress.completed)}/
                        {digitsEnToFa(progress.total)}
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="border-border bg-card rounded-xl border shadow-lg"
                      >
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/projects/${project._id}/details`)
                          }
                          className="gap-2 rounded-lg p-3 text-xs font-semibold"
                        >
                          <FileText className="size-4" />
                          {projectsText.details.viewDetails}
                        </DropdownMenuItem>
                        {canEditDelete ? (
                          <>
                            <DropdownMenuSeparator className="bg-border/40" />
                            <DropdownMenuItem
                              onClick={() => onEdit(project._id)}
                              className="gap-2 rounded-lg p-3 text-xs font-semibold"
                            >
                              <Edit className="size-4" />
                              {projectsText.edit.title}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(project)}
                              className="text-destructive gap-2 rounded-lg p-3 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash className="size-4" />
                              {projectsText.delete.title}
                            </DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedProject && (
        <DeleteProjectDialog
          project={selectedProject}
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
        />
      )}
    </>
  );
}
