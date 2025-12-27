import { Edit, Target, Trash, Users, FileText, Layers } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { DeleteProjectDialog } from "@/components/project/delete-project-dialog";
import { Button } from "@/components/ui/button";
import {
  project as projectLabels,
  projects as projectsText,
} from "@/constants";
import { useTasks } from "@/hooks";
import type { ProjectsResponse } from "@/lib/pocketbase-types";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconHash, IconActivity } from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";

type ProjectListGroupProps = {
  projects: ProjectsResponse[];
  onEdit: (projectId: string) => void;
  canEditDelete: boolean;
};

export function ProjectListGroup({
  projects,
  onEdit,
  canEditDelete,
}: ProjectListGroupProps) {
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectsResponse | null>(null);

  const { data: allTasksResult } = useTasks({
    expandFields: "project,assignee",
    mode: "full",
  });
  const allTasks = allTasksResult?.items ?? [];

  const handleDelete = (project: ProjectsResponse) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  const getProjectProgress = (projectId: string) => {
    if (!allTasks) return { total: 0, completed: 0, progress: 0 };

    const projectTasks = allTasks.filter((task) => task.project === projectId);
    const completedTasks = projectTasks.filter(
      (task) => task.status === TasksStatusOptions.done,
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const progress = getProjectProgress(project.id);
          return (
            <div
              key={project.id}
              className="bg-card group relative flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md"
            >
              {/* Card Header */}
              <div className="border-b p-[var(--ds-spacing-cardPadding)]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110">
                      <Layers className="size-6" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-muted-foreground flex items-center gap-1.5">
                        <IconHash className="size-3" />
                        <span className="text-[10px] font-bold tracking-wider">
                          {project.code}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold tracking-tight">
                        {project.name}
                      </h3>
                    </div>
                  </div>

                  {canEditDelete && (
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(project.id);
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8 rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project);
                        }}
                      >
                        <Trash className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Section */}
              <div className="p-[var(--ds-spacing-cardPadding)]">
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <div className="text-muted-foreground flex items-center gap-1.5">
                      <IconActivity className="size-3" />
                      <span className="text-[10px] font-bold tracking-wider">
                        {projectLabels.progress}
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight tabular-nums">
                        {digitsEnToFa(progress.progress)}
                      </span>
                      <span className="text-sm font-bold opacity-40">%</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-muted-foreground text-[10px] font-bold tracking-wider">
                      Tasks
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 font-bold">
                      <span className="text-lg tabular-nums">
                        {digitsEnToFa(progress.completed)}
                      </span>
                      <span className="text-sm opacity-20">/</span>
                      <span className="text-lg tabular-nums">
                        {digitsEnToFa(progress.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <Progress value={progress.progress} className="mt-6 h-2" />
              </div>

              {/* Action Grid */}
              <div className="mt-auto grid grid-cols-3 gap-1.5 border-t p-1.5">
                <Button
                  variant="ghost"
                  className="hover:bg-muted/50 flex h-14 flex-col items-center justify-center rounded-xl font-bold transition-colors"
                  onClick={() => navigate(`/projects/${project.id}/details`)}
                >
                  <FileText className="size-4" />
                  <span className="mt-1 text-[10px]">
                    {projectsText.details.viewDetails}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="hover:bg-muted/50 flex h-14 flex-col items-center justify-center rounded-xl font-bold transition-colors"
                  onClick={() => navigate(`/projects/${project.id}/tasks`)}
                >
                  <Target className="size-4" />
                  <span className="mt-1 text-[10px]">
                    {projectLabels.tasks}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="hover:bg-muted/50 flex h-14 flex-col items-center justify-center rounded-xl font-bold transition-colors"
                  onClick={() => navigate(`/projects/${project.id}/users`)}
                >
                  <Users className="size-4" />
                  <span className="mt-1 text-[10px]">
                    {projectLabels.users}
                  </span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <DeleteProjectDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        project={selectedProject}
      />
    </>
  );
}
