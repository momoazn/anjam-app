import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ClientResponseError } from "pocketbase";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { ProjectFields } from "@/components/forms/project-fields";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { fa } from "@/constants/text";
import { FileWithPreview } from "@/hooks/use-file-upload";
import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/hooks";
import { useAuthUser } from "@/store/auth-store";
import { ProjectsResponse } from "@/lib/pocketbase-types";

const projectFormSchema = z.object({
  name: z.string().min(1, { message: fa.projects.create.form.nameRequired }),
  code: z.string().min(1, {
    message: fa.projects.create.form.codeRequired,
  }),
  description: z.string().optional(),
  assets: z.array(z.instanceof(File)).optional(),
  supervisor: z.string().optional(),
});

export default function EditProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthUser();
  const isAdmin = user?.role === "admin";

  const { data: project, isLoading } = useQuery({
    queryKey: queryKeys.projects.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Project ID is required");
      return pb.collection("projects").getOne<ProjectsResponse>(id);
    },
    enabled: !!id,
  });

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      assets: [],
      supervisor: "",
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        code: project.code,
        // Convert HTML breaks back to newlines for textarea
        description: (project.description || "").replace(/<br>/g, "\n"),
        assets: [],
        supervisor: project.supervisor || "",
      });
    }
  }, [form, project]);

  const { mutate: updateProject, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof projectFormSchema>) => {
      if (!project) throw new Error("Project not found");

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("code", data.code.toUpperCase());

      if (data.supervisor) {
        formData.append("supervisor", data.supervisor);
      }

      if (data.description !== undefined) {
        // Convert line breaks to HTML
        const descriptionWithBreaks = data.description.replace(/\n/g, "<br>");
        formData.append("description", descriptionWithBreaks);
      }

      // Handle new file uploads
      if (data.assets && data.assets.length > 0) {
        data.assets.forEach((file: FileWithPreview) => {
          formData.append("assets", file);
        });
      }

      return pb.collection("projects").update(project.id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      if (project) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(project.id),
        });
      }
      toast.success(fa.projects.edit.success);
      navigate("/projects");
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

  function onSubmit(values: z.infer<typeof projectFormSchema>) {
    updateProject(values);
  }

  if (isLoading) {
    return (
      <PageTransition className="container mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  if (!project) {
    return (
      <PageTransition className="container mx-auto space-y-6 p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
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

  return (
    <PageTransition className="container mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{fa.projects.edit.title}</h1>
          <p className="text-muted-foreground">
            {fa.common.buttons.view} {project.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{fa.projects.edit.title}</CardTitle>
          <CardDescription>
            {fa.common.buttons.view} {project.code}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ProjectFields
                control={form.control}
                showSupervisor={true}
                isAdmin={isAdmin}
              />
              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/projects")}
                  disabled={isPending}
                >
                  {fa.common.cancel}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="text-muted-foreground mr-2 size-4 animate-spin" />
                  ) : null}
                  {fa.projects.edit.submit}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
