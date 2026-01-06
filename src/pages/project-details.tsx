import { ArrowLeft, Folder } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { ProjectDetailsSections } from "@/components/project/project-details-sections";
import { ProjectDetailsSkeleton } from "@/components/project/project-details-skeleton";
import { ProjectSidebar } from "@/components/project/project-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { common, projects } from "@/constants";
import { useAllTasks, useProject, useUpdateProject } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  useAuthUser,
  useCurrentOrgMode,
  useCurrentOrgRole,
} from "@/store/auth-store";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthUser();
  const mode = useCurrentOrgMode();
  const currentOrgRole = useCurrentOrgRole();
  const isProductMode = mode === "product";
  const isAdmin = currentOrgRole === "owner";

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedCode, setEditedCode] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  const { data: project, isLoading: projectLoading } = useProject({
    id,
    enabled: !!id,
  });

  const { data: tasks, isLoading: tasksLoading } = useAllTasks({
    projectId: id,
    enabled: !!id,
  });

  const canEdit = isAdmin || project?.supervisorUserId === user?._id;

  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject({
    onSuccess: () => {
      toast.success(projects.edit.success);
      setIsEditing(false);
    },
  });

  const handleStartEdit = () => {
    if (project) {
      setEditedName(project.name || "");
      setEditedCode(project.code || "");
      setEditedDescription(project.description || "");
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!id) return;
    if (!editedName.trim()) {
      toast.error(projects.create.form.nameRequired);
      return;
    }

    updateProject({
      id,
      updates: {
        name: editedName,
        description: editedDescription,
      },
    });
  };

  if (projectLoading) {
    return <ProjectDetailsSkeleton />;
  }

  if (!project) {
    return (
      <PageTransition className="container mx-auto p-6">
        <Card>
          <CardContent
            className="flex flex-col items-center justify-center py-12"
            data-animate-stagger
          >
            <Folder className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-muted-foreground">{projects.errors.notFound}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft className="ms-2 h-4 w-4" />
              {projects.details.backToProjects}
            </Button>
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  const totalTasks = tasks?.length || 0;
  const completedTasks =
    tasks?.filter((task) => task.status === "done").length || 0;
  const inProgressTasks =
    tasks?.filter((task) => task.status === "in_progress").length || 0;
  const totalTimeSpent =
    tasks?.reduce((sum, task) => sum + (task.timeSpentMinutes || 0), 0) || 0;

  return (
    <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
      <PageHeader
        title={isEditing ? editedName || project.name : project.name}
        subtitle={
          <span className="font-mono text-xs font-bold tracking-wider opacity-60">
            {isEditing
              ? editedCode || project.code || "PRJ"
              : project.code || "PRJ"}
          </span>
        }
        icon={Folder}
        eyebrow={
          isProductMode ? undefined : (
            <Button
              variant="link"
              className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs font-medium"
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              {projects.details.backToProjects}
            </Button>
          )
        }
        actions={
          isEditing ? (
            <div className="flex items-center gap-2">
              {isProductMode ? (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => navigate("/projects")}
                >
                  <ArrowLeft className="me-2 h-4 w-4" />
                  {projects.details.backToProjects}
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size={isProductMode ? "xs" : "sm"}
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                {common.cancel}
              </Button>
              <Button
                size={isProductMode ? "xs" : "sm"}
                onClick={handleSaveEdit}
                disabled={isUpdating}
              >
                {common.save}
              </Button>
            </div>
          ) : (
            canEdit && (
              <Button
                variant="outline"
                size={isProductMode ? "xs" : "sm"}
                onClick={handleStartEdit}
              >
                {common.edit}
              </Button>
            )
          )
        }
      />

      {isProductMode && isEditing ? (
        <div className="mb-4 overflow-hidden rounded-xl border border-border/40 bg-background/30 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="text-muted-foreground text-[10px] font-semibold">
                {projects.create.form.name}
              </div>
              <Input
                value={editedName}
                onChange={(event) => setEditedName(event.target.value)}
                placeholder={projects.create.form.name}
                className="text-sm font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <div className="text-muted-foreground text-[10px] font-semibold">
                {projects.create.form.code}
              </div>
              <Input
                value={editedCode}
                onChange={(event) =>
                  setEditedCode(event.target.value.slice(0, 3))
                }
                placeholder={projects.create.form.code}
                maxLength={3}
                disabled
                className="font-mono text-sm font-semibold tracking-widest opacity-50"
              />
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "grid grid-cols-1 lg:grid-cols-3",
          isProductMode ? "gap-4" : "gap-6",
        )}
        data-animate-stagger
      >
        <ProjectDetailsSections
          project={project as any}
          isEditing={isEditing}
          editedDescription={editedDescription}
          onDescriptionChange={setEditedDescription}
        />

        <ProjectSidebar
          tasksLoading={tasksLoading}
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          inProgressTasks={inProgressTasks}
          totalTimeSpent={totalTimeSpent}
          onViewTasks={() => navigate(`/projects/${id}/tasks`)}
          onViewUsers={() => navigate(`/members`)}
        />
      </div>
    </PageTransition>
  );
}
