import {
  Edit,
  Target,
  Trash,
  Users,
  FileText,
  Layers,
  Hash,
} from "lucide-react";
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
      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        data-animate-stagger
      >
        {projects.map((project) => {
          const progress = getProjectProgress(project.id);
          return (
            <div
              key={project.id}
              className="group bg-card hover:shadow-primary/5 relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 hover:shadow-2xl"
            >
              {/* Card Header */}
              <div className="bg-muted/20 relative border-b p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground shadow-primary/20 flex h-12 w-12 items-center justify-center rounded-none shadow-sm transition-transform group-hover:rotate-12">
                      <Layers className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">
                        {project.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <Hash className="text-muted-foreground/40 size-3" />
                        <span className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
                          {project.code}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canEditDelete && (
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(project.id);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-none text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Section */}
              <div className="p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-muted-foreground/50 text-[10px] font-black tracking-tight uppercase">
                      {projectLabels.progress}
                    </span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-4xl font-black tracking-tighter">
                        {digitsEnToFa(progress.progress)}
                      </span>
                      <span className="text-muted-foreground/40 text-lg font-bold">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground/50 text-[10px] font-black tracking-tight uppercase">
                      Tasks Completed
                    </span>
                    <div className="mt-1 text-sm font-bold">
                      {digitsEnToFa(progress.completed)}{" "}
                      <span className="text-muted-foreground/40 font-medium">
                        /
                      </span>{" "}
                      {digitsEnToFa(progress.total)}
                    </div>
                  </div>
                </div>

                <div className="bg-muted/60 relative mt-4 h-3 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary absolute inset-y-0 start-0 transition-all duration-1000 ease-out"
                    style={{ width: `${progress.progress}%` }}
                  >
                    <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                </div>
              </div>

              {/* Action Grid */}
              <div className="bg-border mt-auto grid grid-cols-3 gap-px border-t">
                <button
                  type="button"
                  className="group/btn bg-card hover:bg-muted/50 flex flex-col items-center justify-center py-4 transition-colors"
                  onClick={() => navigate(`/projects/${project.id}/details`)}
                >
                  <FileText className="text-muted-foreground group-hover/btn:text-primary size-5 transition-transform group-hover/btn:-translate-y-1" />
                  <span className="text-muted-foreground/60 mt-2 text-[10px] font-bold tracking-wider uppercase">
                    {projectsText.details.viewDetails}
                  </span>
                </button>
                <button
                  type="button"
                  className="group/btn bg-card hover:bg-muted/50 flex flex-col items-center justify-center py-4 transition-colors"
                  onClick={() => navigate(`/projects/${project.id}/tasks`)}
                >
                  <Target className="text-muted-foreground group-hover/btn:text-primary size-5 transition-transform group-hover/btn:-translate-y-1" />
                  <span className="text-muted-foreground/60 mt-2 text-[10px] font-bold tracking-wider uppercase">
                    {projectLabels.tasks}
                  </span>
                </button>
                <button
                  type="button"
                  className="group/btn bg-card hover:bg-muted/50 flex flex-col items-center justify-center py-4 transition-colors"
                  onClick={() => navigate(`/projects/${project.id}/users`)}
                >
                  <Users className="text-muted-foreground group-hover/btn:text-primary size-5 transition-transform group-hover/btn:-translate-y-1" />
                  <span className="text-muted-foreground/60 mt-2 text-[10px] font-bold tracking-wider uppercase">
                    {projectLabels.users}
                  </span>
                </button>
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
