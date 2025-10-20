import { Edit, Trash, Users, Target } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { DeleteProjectDialog } from "@/components/project/delete-project-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ProjectsResponse,
  TasksResponse,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { pb } from "@/lib/pocketbase";
import { digitsEnToFa } from "@persian-tools/persian-tools";

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

  // Fetch all tasks to calculate progress
  const { data: allTasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => pb.collection("tasks").getFullList<TasksResponse>(),
  });

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const progress = getProjectProgress(project.id);
          return (
            <Card
              key={project.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{project.name}</span>
                  {canEditDelete && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onEdit(project)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-6 w-6"
                        onClick={() => handleDelete(project)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
                <p className="text-muted-foreground text-sm">{project.code}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress indicator with real data */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>پیشرفت پروژه</span>
                    <span>{digitsEnToFa(progress.progress)}%</span>
                  </div>
                  <div className="bg-muted/60 h-2 w-full rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>
                      {digitsEnToFa(progress.completed)} از{" "}
                      {digitsEnToFa(progress.total)} تسک تکمیل شده
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/projects/${project.id}/tasks`)}
                  >
                    <Target className="mr-2 h-3 w-3" />
                    تسک‌ها
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/projects/${project.id}/users`)}
                  >
                    <Users className="mr-2 h-3 w-3" />
                    کاربران
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
