import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Folder } from "lucide-react";
import { ClientResponseError } from "pocketbase";
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
import { common, errors, projects } from "@/constants";
import { queryKeys } from "@/hooks";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import { type ProjectWithSupervisor, pb } from "@/lib/pocketbase";
import type { TasksResponse } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthUser();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedCode, setEditedCode] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [newFiles, setNewFiles] = useState<FileWithPreview[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: queryKeys.projects.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error(errors.validation.projectIdRequired);
      return pb.collection("projects").getOne<ProjectWithSupervisor>(id, {
        expand: "supervisor",
      });
    },
    enabled: !!id,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", "project", id],
    queryFn: async () => {
      if (!id) throw new Error(errors.validation.projectIdRequired);
      return pb
        .collection("tasks")
        .getFullList<TasksResponse>({ filter: `project="${id}"` });
    },
    enabled: !!id,
  });

  const canEdit =
    user?.role === "admin" ||
    (user?.role === "supervisor" && project?.supervisor === user?.id);

  const { mutate: updateProject, isPending: isUpdating } = useMutation({
    mutationFn: async (data: {
      name: string;
      code: string;
      description: string;
      newFiles: FileWithPreview[];
      filesToDelete: string[];
    }) => {
      if (!id) throw new Error(errors.validation.projectIdRequired);
      if (!project) throw new Error(errors.notFound.projectNotFound);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("code", data.code.toUpperCase());
      const descriptionWithBreaks = data.description.replace(/\n/g, "<br>");
      formData.append("description", descriptionWithBreaks);

      data.newFiles.forEach((file) => {
        formData.append("assets+", file);
      });

      data.filesToDelete.forEach((filename) => {
        formData.append("assets-", filename);
      });

      return pb.collection("projects").update(id, formData);
    },
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(id),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      toast.success(projects.edit.success);
      setIsEditing(false);
      setNewFiles([]);
      setFilesToDelete([]);
    },
    onError: (error: Error) => {
      let errorMessage = error.message;

      if (error instanceof ClientResponseError && error.data?.data) {
        const validationErrors = error.data.data as Record<
          string,
          { code: string; message: string }
        >;
        const errorMessages: string[] = [];

        Object.keys(validationErrors).forEach((field) => {
          const fieldError = validationErrors[field];
          if (fieldError.message) {
            errorMessages.push(fieldError.message);
          }
        });

        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join(" | ");
        }
      }

      toast.error(projects.edit.error.replace("{error}", errorMessage));
    },
  });

  const handleStartEdit = () => {
    if (project) {
      setEditedName(project.name || "");
      setEditedCode(project.code || "");
      setEditedDescription(project.description || "");
      setNewFiles([]);
      setFilesToDelete([]);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewFiles([]);
    setFilesToDelete([]);
  };

  const handleSaveEdit = () => {
    if (!editedName.trim()) {
      toast.error(projects.create.form.nameRequired);
      return;
    }
    if (!editedCode.trim()) {
      toast.error(projects.create.form.codeRequired);
      return;
    }

    updateProject({
      name: editedName,
      code: editedCode,
      description: editedDescription,
      newFiles,
      filesToDelete,
    });
  };

  const handleDeleteFile = (filename: string) => {
    setFilesToDelete((prev) => [...prev, filename]);
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
    tasks?.reduce((sum, task) => sum + (task.time_spent_minutes || 0), 0) || 0;

  return (
    <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
      <PageHeader
        title={
          isEditing ? (
            <div className="flex flex-col gap-2">
              <span className="text-primary text-[10px] font-bold tracking-tight">
                {projects.create.form.name}
              </span>
              <Input
                value={editedName}
                onChange={(event) => setEditedName(event.target.value)}
                placeholder={projects.create.form.name}
                className="h-10 text-lg font-bold"
              />
            </div>
          ) : (
            project.name
          )
        }
        description={
          isEditing ? (
            <div className="mt-2 w-40 space-y-2">
              <span className="text-muted-foreground/40 text-[10px] font-bold tracking-tight">
                {projects.create.form.code}
              </span>
              <Input
                value={editedCode}
                onChange={(event) =>
                  setEditedCode(event.target.value.slice(0, 3))
                }
                placeholder={projects.create.form.code}
                maxLength={3}
                className="h-10 font-mono text-base font-bold tracking-widest"
              />
            </div>
          ) : (
            <span className="font-mono text-xs font-bold tracking-wider opacity-60">
              {project.code || "PRJ"}
            </span>
          )
        }
        icon={Folder}
        eyebrow={
          <Button
            variant="link"
            className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs font-medium"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            {projects.details.backToProjects}
          </Button>
        }
        actions={
          isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="h-9 px-4 text-xs font-bold"
              >
                {common.cancel}
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="bg-primary text-primary-foreground h-9 px-6 text-xs font-bold shadow-sm"
              >
                {common.save}
              </Button>
            </div>
          ) : (
            canEdit && (
              <Button
                variant="outline"
                onClick={handleStartEdit}
                className="h-9 px-4 text-xs font-bold shadow-sm"
              >
                {common.edit}
              </Button>
            )
          )
        }
      />

      <div
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        data-animate-stagger
      >
        <ProjectDetailsSections
          project={project}
          isEditing={isEditing}
          editedDescription={editedDescription}
          filesToDelete={filesToDelete}
          newFiles={newFiles}
          onDescriptionChange={setEditedDescription}
          onNewFilesChange={setNewFiles}
          onDeleteFile={handleDeleteFile}
        />

        <ProjectSidebar
          tasksLoading={tasksLoading}
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          inProgressTasks={inProgressTasks}
          totalTimeSpent={totalTimeSpent}
          onViewTasks={() => navigate(`/projects/${id}/tasks`)}
          onViewUsers={() => navigate(`/projects/${id}/users`)}
        />
      </div>
    </PageTransition>
  );
}
