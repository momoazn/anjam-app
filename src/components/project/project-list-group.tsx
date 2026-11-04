import { digitsEnToFa } from "@persian-tools/persian-tools";
import { formatDistanceToNow } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";
import { Edit, FileText, MoreHorizontal, Trash } from "lucide-react";
import { useMemo, useState } from "react";
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
import { UserAvatar } from "@/components/user-avatar";
import { projects as projectsText } from "@/constants";
import { useAllTasks } from "@/hooks/tasks";
import { useOpenModal } from "@/store/modal-store";

type ProjectListItem = {
  _id: string;
  name: string;
  code: string;
};

type ProjectStats = {
  total: number;
  completed: number;
  assignees: Map<
    string,
    { displayName?: string; email?: string; image?: string }
  >;
  lastActivity: number;
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

  const openModal = useOpenModal();

  // Non-paginated query so progress stays correct with more than one page of tasks.
  const { data: allTasks } = useAllTasks();

  const statsByProject = useMemo(() => {
    const map = new Map<string, ProjectStats>();
    for (const task of allTasks ?? []) {
      const id = task.projectId as string;
      const stats = map.get(id) ?? {
        total: 0,
        completed: 0,
        assignees: new Map(),
        lastActivity: 0,
      };
      stats.total += 1;
      if (task.status === "done") stats.completed += 1;
      if (task.assignee && task.assigneeUserId) {
        stats.assignees.set(task.assigneeUserId as string, task.assignee);
      }
      stats.lastActivity = Math.max(
        stats.lastActivity,
        task.updatedAt ? new Date(task.updatedAt).getTime() : 0,
      );
      map.set(id, stats);
    }
    return map;
  }, [allTasks]);

  const handleDelete = (project: ProjectListItem) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  return (
    <>
      {projects.length === 0 ? (
        <EmptyStateNoProjects
          onCreate={canCreate ? () => openModal("create-project") : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const stats = statsByProject.get(project._id);
            const total = stats?.total ?? 0;
            const completed = stats?.completed ?? 0;
            const percent =
              total > 0 ? Math.round((completed / total) * 100) : 0;
            const assignees = Array.from(stats?.assignees.values() ?? []);
            const open = () => navigate(`/projects/${project._id}/tasks`);

            return (
              <div
                key={project._id}
                role="link"
                tabIndex={0}
                data-testid="project-card"
                className="border-border/60 bg-card hover:border-primary/40 focus-visible:ring-ring group flex cursor-pointer flex-col gap-4 rounded-xl border p-4 text-right transition-colors focus-visible:ring-2 focus-visible:outline-none"
                onClick={open}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open();
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <span className="bg-muted text-muted-foreground inline-block rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider">
                      {project.code}
                    </span>
                    <h3 className="group-hover:text-primary truncate text-base font-semibold transition-colors">
                      {project.name}
                    </h3>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="-mt-1 -ms-1 size-8 shrink-0 rounded-lg"
                        aria-label={projectsText.details.viewDetails}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/projects/${project._id}/details`)
                        }
                        className="gap-2 text-xs font-semibold"
                      >
                        <FileText className="size-4" />
                        {projectsText.details.viewDetails}
                      </DropdownMenuItem>
                      {canEditDelete ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onEdit(project._id)}
                            className="gap-2 text-xs font-semibold"
                          >
                            <Edit className="size-4" />
                            {projectsText.edit.title}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(project)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2 text-xs font-semibold"
                          >
                            <Trash className="size-4" />
                            {projectsText.delete.title}
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-1.5">
                  <div
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="bg-muted h-1.5 overflow-hidden rounded-full"
                  >
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs tabular-nums">
                    {total === 0
                      ? projectsText.list.noTasksYet
                      : projectsText.list.progress
                          .replace("{done}", digitsEnToFa(completed))
                          .replace("{total}", digitsEnToFa(total))}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <div className="flex items-center -space-x-1 rtl:space-x-reverse">
                    {assignees.slice(0, 3).map((user, i) => (
                      <UserAvatar
                        key={i}
                        user={user}
                        className="size-6 [&>span]:text-[10px]"
                      />
                    ))}
                    {assignees.length > 3 && (
                      <span
                        dir="ltr"
                        className="bg-muted text-muted-foreground ring-card z-10 flex size-6 items-center justify-center rounded-full text-[10px] ring-2"
                      >
                        +{digitsEnToFa(assignees.length - 3)}
                      </span>
                    )}
                  </div>
                  {stats && stats.lastActivity > 0 && (
                    <span className="text-muted-foreground text-xs">
                      {digitsEnToFa(
                        formatDistanceToNow(new Date(stats.lastActivity), {
                          addSuffix: true,
                          locale: faIR,
                        }),
                      )}
                    </span>
                  )}
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
