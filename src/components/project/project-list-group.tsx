import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconActivity,
  IconHash,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import {
  Edit,
  FileText,
  Layers,
  MoreHorizontal,
  Target,
  Trash,
  Users,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import {
  project as projectLabels,
  projects as projectsText,
} from "@/constants";
import { useTasks } from "@/hooks";
import {
  type UserPreferences,
  useToggleProjectFavorite,
  useUserPreferences,
} from "@/hooks/user-preferences";
import type { ProjectsResponse } from "@/lib/pocketbase-types";
import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";
import { useCurrentOrgMode } from "@/store/auth-store";

type ProjectListGroupProps = {
  projects: ProjectsResponse[];
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
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectsResponse | null>(null);

  const { data: preferencesData } = useUserPreferences();
  const toggleFavorite = useToggleProjectFavorite();

  const favoriteIds =
    (preferencesData?.preferences as UserPreferences)?.favorites?.projectIds ||
    [];

  const { data: allTasksResult } = useTasks({
    expandFields: "project,assignee",
    mode: "full",
  });
  const allTasks = allTasksResult?.items ?? [];

  const handleDelete = (project: ProjectsResponse) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  const handleToggleFavorite = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    toggleFavorite.mutate(projectId);
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
      {projects.length === 0 ? (
        canCreate ? (
          <EmptyStateNoProjects onCreate={() => navigate("/projects/new")} />
        ) : (
          <EmptyStateNoProjects />
        )
      ) : isProductMode ? (
        <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30">
          {projects.map((project) => {
            const progress = getProjectProgress(project.id);
            const isFavorite = favoriteIds.includes(project.id);

            return (
              <div
                key={project.id}
                className="group border-b border-border/40 last:border-b-0"
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="flex h-auto w-full items-center justify-between gap-3 rounded-none px-3 py-3 text-right hover:bg-muted/30"
                  onClick={() => navigate(`/projects/${project.id}/tasks`)}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, project.id)}
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                        isFavorite
                          ? "bg-amber-500/10 text-amber-500"
                          : "text-muted-foreground/50 hover:bg-muted/40",
                      )}
                      aria-label="علاقه‌مندی"
                    >
                      {isFavorite ? (
                        <IconStarFilled className="size-4" />
                      ) : (
                        <IconStar className="size-4" />
                      )}
                    </button>

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
                            navigate(`/projects/${project.id}/details`)
                          }
                          className="gap-2 rounded-lg p-3 text-xs font-semibold"
                        >
                          <FileText className="size-4" />
                          {projectsText.details.viewDetails}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/projects/${project.id}/users`)
                          }
                          className="gap-2 rounded-lg p-3 text-xs font-semibold"
                        >
                          <Users className="size-4" />
                          {projectLabels.users}
                        </DropdownMenuItem>
                        {canEditDelete ? (
                          <>
                            <DropdownMenuSeparator className="bg-border/40" />
                            <DropdownMenuItem
                              onClick={() => onEdit(project.id)}
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
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const progress = getProjectProgress(project.id);
            const isFavorite = favoriteIds.includes(project.id);

            return (
              <div
                key={project.id}
                className="bg-card group relative flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md"
              >
                {/* Favorite Button */}
                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(e, project.id)}
                  className={cn(
                    "absolute left-3 top-3 z-10 flex size-8 items-center justify-center rounded-lg transition-all",
                    isFavorite
                      ? "bg-amber-500/10 text-amber-500 scale-100"
                      : "bg-muted/50 text-muted-foreground/40 hover:bg-muted scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100",
                  )}
                >
                  {isFavorite ? (
                    <IconStarFilled className="size-4" />
                  ) : (
                    <IconStar className="size-4" />
                  )}
                </button>

                {/* Card Header */}
                <div className="border-b p-6">
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
                <div className="p-6">
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
                        {projectLabels.tasks}
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
      )}

      <DeleteProjectDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        project={selectedProject}
      />
    </>
  );
}
