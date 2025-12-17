import { Edit, Target, Trash, Users, FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { DeleteProjectDialog } from "@/components/project/delete-project-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fa } from "@/constants";
import { useTasks } from "@/hooks";
import { ProjectsResponse, TasksStatusOptions } from "@/lib/pocketbase-types";
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

  // Fetch all tasks to calculate progress
  const { data: allTasksResult } = useTasks({
    expandFields: "project,assignee",
    mode: "full",
  });
  const allTasks = allTasksResult?.items ?? [];

  const handleDelete = (project: ProjectsResponse) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  // Calculate project progress
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
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        data-animate-stagger
      >
        {projects.map((project) => {
          const progress = getProjectProgress(project.id);
          return (
            <Card
              key={project.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => navigate(`/projects/${project.id}/details`)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="block truncate">{project.name}</span>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {project.code}
                    </p>
                  </div>
                  {canEditDelete && (
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(project.id);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project);
                        }}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress indicator with real data */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{fa.project.progress}</span>
                    <span className="font-medium">
                      {digitsEnToFa(progress.progress)}%
                    </span>
                  </div>
                  <div className="bg-muted/60 h-2 w-full rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {digitsEnToFa(progress.completed)} {fa.project.of}{" "}
                    {digitsEnToFa(progress.total)} {fa.project.completedTasks}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-0 flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${project.id}/details`);
                    }}
                  >
                    <FileText className="mr-2 h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      {fa.projects.details.viewDetails}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-0 flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${project.id}/tasks`);
                    }}
                  >
                    <Target className="mr-2 h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{fa.project.tasks}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-0 flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${project.id}/users`);
                    }}
                  >
                    <Users className="mr-2 h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{fa.project.users}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
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
