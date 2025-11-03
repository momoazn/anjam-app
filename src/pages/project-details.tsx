import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Edit,
  FileText,
  Folder,
  Save,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { ClientResponseError } from "pocketbase";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { ProjectAssets } from "@/components/project/project-assets";
import { PageTransition } from "@/components/page-transition";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { fa } from "@/constants/text";
import { FileWithPreview } from "@/hooks/use-file-upload";
import { pb, ProjectWithSupervisor } from "@/lib/pocketbase";
import { TasksResponse } from "@/lib/pocketbase-types";
import { getUserInitials } from "@/lib/utils";
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
    queryKey: ["projects", id],
    queryFn: async () => {
      if (!id) throw new Error("Project ID is required");
      return pb.collection("projects").getOne<ProjectWithSupervisor>(id, {
        expand: "supervisor",
      });
    },
    enabled: !!id,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", "project", id],
    queryFn: async () => {
      if (!id) throw new Error("Project ID is required");
      return pb
        .collection("tasks")
        .getFullList<TasksResponse>({ filter: `project="${id}"` });
    },
    enabled: !!id,
  });

  // Check if user can edit (admin or supervisor of this project)
  const canEdit =
    user?.role === "admin" ||
    (user?.role === "supervisor" && project?.supervisor === user?.id);

  // Update mutation for project
  const { mutate: updateProject, isPending: isUpdating } = useMutation({
    mutationFn: async (data: {
      name: string;
      code: string;
      description: string;
      newFiles: FileWithPreview[];
      filesToDelete: string[];
    }) => {
      if (!id) throw new Error("Project ID is required");

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("code", data.code.toUpperCase());
      // Convert line breaks to HTML
      const descriptionWithBreaks = data.description.replace(/\n/g, "<br>");
      formData.append("description", descriptionWithBreaks);

      // Add new files
      data.newFiles.forEach((file) => {
        formData.append("assets", file);
      });

      // Delete files using PocketBase - prefix
      data.filesToDelete.forEach((filename) => {
        formData.append("assets-", filename);
      });

      return pb.collection("projects").update(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(fa.projects.edit.success);
      setIsEditing(false);
      setNewFiles([]);
      setFilesToDelete([]);
    },
    onError: (error: Error) => {
      // Parse PocketBase validation errors
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

      toast.error(fa.projects.edit.error.replace("{error}", errorMessage));
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
      toast.error(fa.projects.create.form.nameRequired);
      return;
    }
    if (editedCode.length !== 3) {
      toast.error(fa.projects.create.form.codeLength);
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
          <CardContent className="flex flex-col items-center justify-center py-12" data-animate-stagger>
            <Folder className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-muted-foreground">پروژه یافت نشد</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft className="ml-2 h-4 w-4" />
              {fa.projects.details.backToProjects}
            </Button>
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  const supervisor = project.expand?.supervisor;
  const totalTasks = tasks?.length || 0;
  const completedTasks =
    tasks?.filter((task) => task.status === "done").length || 0;
  const inProgressTasks =
    tasks?.filter((task) => task.status === "in_progress").length || 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <PageTransition className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {isEditing ? (
            <div className="flex-1 space-y-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder={fa.projects.create.form.name}
                className="h-auto text-2xl font-bold"
              />
              <Input
                value={editedCode}
                onChange={(e) => setEditedCode(e.target.value.slice(0, 3))}
                placeholder={fa.projects.create.form.code}
                maxLength={3}
                className="w-32"
              />
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground">
                {fa.common.buttons.view} {project.code}
              </p>
            </div>
          )}
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  <X className="mr-2 h-4 w-4" />
                  {fa.common.cancel}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={isUpdating}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {fa.common.save}
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={handleStartEdit}>
                <Edit className="mr-2 h-4 w-4" />
                {fa.common.edit}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3" data-animate-stagger>
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {fa.projects.details.information}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Supervisor */}
              <div className="flex items-center gap-3" data-animate-stagger>
                <User className="text-muted-foreground h-5 w-5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {fa.projects.details.supervisor}
                  </p>
                  {supervisor ? (
                    <div className="mt-1 flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={pb.files.getUrl(supervisor, supervisor.avatar)}
                        />
                        <AvatarFallback>
                          {getUserInitials(
                            supervisor.first_name,
                            supervisor.last_name,
                            supervisor.username,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground text-sm">
                        {getUserInitials(
                          supervisor.first_name,
                          supervisor.last_name,
                          supervisor.username,
                        )}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </div>
              </div>

              <Separator />

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4" data-animate-stagger>
                <div className="flex items-start gap-3">
                  <Calendar className="text-muted-foreground mt-0.5 h-5 w-5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {fa.projects.details.createdAt}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {formatDate(project.created)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="text-muted-foreground mt-0.5 h-5 w-5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {fa.projects.details.updatedAt}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {formatDate(project.updated)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>{fa.projects.details.description}</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editedDescription.replace(/<br>/g, "\n")}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder={fa.projects.create.form.descriptionPlaceholder}
                  className="min-h-32"
                />
              ) : project.description ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              ) : (
                <p className="text-muted-foreground py-6 text-center">
                  {fa.projects.details.noDescription}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{fa.projects.details.files}</span>
                {!isEditing && project.assets && project.assets.length > 0 && (
                  <span className="text-muted-foreground text-sm font-normal">
                    {fa.projects.details.filesCount.replace(
                      "{count}",
                      String(project.assets.length),
                    )}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  {/* Existing Files */}
                  {project.assets && project.assets.length > 0 && (
                      <div className="space-y-2" data-animate-stagger>
                        <h4 className="text-sm font-medium">
                          {fa.projects.files.existingFiles}
                        </h4>
                        <div className="grid grid-cols-1 gap-2" data-animate-stagger>
                          {project.assets
                            .filter(
                              (filename) => !filesToDelete.includes(filename),
                            )
                            .map((filename, index) => (
                              <div
                                key={`${filename}-${index}`}
                                className="bg-muted/50 flex items-center justify-between rounded-lg p-3"
                                data-interactive-item
                              >
                                <span className="flex-1 truncate text-sm">
                                  {filename}
                                </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteFile(filename)}
                                className="text-destructive h-8 w-8 shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* New Files Upload */}
                  <div className="space-y-2" data-animate-stagger>
                    <h4 className="flex items-center gap-2 text-sm font-medium">
                      <Upload className="h-4 w-4" />
                      {fa.projects.files.addNewFiles}
                    </h4>
                    <FileUpload
                      value={newFiles}
                      onChange={setNewFiles}
                      maxSize={52428800}
                    />
                  </div>
                </>
              ) : (
                <ProjectAssets project={project} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6" data-animate-stagger>
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>{fa.projects.details.statistics}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasksLoading ? (
                <div className="space-y-3" data-animate-stagger>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <>
                  <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3" data-interactive-item>
                    <span className="text-sm font-medium">
                      {fa.projects.details.totalTasks}
                    </span>
                    <span className="text-2xl font-bold">{totalTasks}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-green-500/10 p-3" data-interactive-item>
                    <span className="text-sm font-medium">
                      {fa.projects.details.completedTasks}
                    </span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {completedTasks}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-blue-500/10 p-3" data-interactive-item>
                    <span className="text-sm font-medium">
                      {fa.projects.details.inProgressTasks}
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {inProgressTasks}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>عملیات سریع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2" data-animate-stagger>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/projects/${id}/tasks`)}
              >
                {fa.projects.list.viewTasks}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/projects/${id}/users`)}
              >
                {fa.projects.users.title}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

function ProjectDetailsSkeleton() {
  return (
    <PageTransition className="container mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3" data-animate-stagger>
        <div className="space-y-6 lg:col-span-2" data-animate-stagger>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4" data-animate-stagger>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6" data-animate-stagger>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-3" data-animate-stagger>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
