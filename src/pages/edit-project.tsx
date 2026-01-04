import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2, IconPencil } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { ProjectFields } from "@/components/forms/project-fields";
import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { ProjectStatusesSettings } from "@/components/project/project-statuses-settings";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { common, errors, projects } from "@/constants";
import { queryKeys } from "@/hooks";
import { FileWithPreview } from "@/hooks/use-file-upload";
import { handlePocketBaseError } from "@/lib/error-handler";
import { pb } from "@/lib/pocketbase";
import { ProjectsResponse } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";
import { useAuthUser, useCurrentOrgMode } from "@/store/auth-store";

const projectFormSchema = z.object({
  name: z.string().min(1, { message: projects.create.form.nameRequired }),
  code: z.string().min(1, {
    message: projects.create.form.codeRequired,
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
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
  const isAdmin = user?.role === "admin";

  const { data: project, isLoading } = useQuery({
    queryKey: queryKeys.projects.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error(errors.validation.projectIdRequired);
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
        description: (project.description || "").replace(/<br>/g, "\n"),
        assets: [],
        supervisor: project.supervisor || "",
      });
    }
  }, [form, project]);

  const { mutate: updateProject, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof projectFormSchema>) => {
      if (!project) throw new Error(errors.notFound.projectNotFound);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("code", data.code.toUpperCase());

      if (data.supervisor) {
        formData.append("supervisor", data.supervisor);
      }

      if (data.description !== undefined) {
        const descriptionWithBreaks = data.description.replace(/\n/g, "<br>");
        formData.append("description", descriptionWithBreaks);
      }

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
      toast.success(projects.edit.success);
      navigate("/projects");
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });

  function onSubmit(values: z.infer<typeof projectFormSchema>) {
    updateProject(values);
  }

  const handleCancel = () => {
    navigate("/projects");
  };

  return (
    <PageTransition
      className={cn(
        "mx-auto w-full p-4 md:p-6",
        isProductMode ? "max-w-3xl" : "max-w-7xl",
      )}
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 opacity-20">
          <IconLoader2 className="h-12 w-12 animate-spin" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isProductMode ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 text-right">
                  <h1 className="truncate text-base font-semibold">
                    {projects.edit.title}
                  </h1>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {project?.name || id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={isPending}
                    className="h-8 rounded-lg px-3 text-xs font-semibold"
                  >
                    {common.cancel}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-8 gap-2 rounded-lg px-3 text-xs font-semibold"
                  >
                    {isPending && (
                      <IconLoader2 className="me-1 size-4 animate-spin" />
                    )}
                    <span>{projects.edit.submit}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <PageHeader
                title={projects.edit.title}
                subtitle={project?.name || id}
                icon={IconPencil}
              />
            )}

            <div
              className={cn(
                "border-border/40 rounded-2xl border",
                isProductMode
                  ? "bg-background/30 p-4 shadow-none"
                  : "bg-card p-8 shadow-sm",
              )}
            >
              <ProjectFields
                control={form.control}
                codeMode={isProductMode ? "readonly" : "editable"}
                showSupervisor={!isProductMode}
                isAdmin={isAdmin}
              />

              {isProductMode ? null : (
                <div className="border-border/10 flex items-center justify-end gap-3 border-t pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isPending}
                    className="h-11 rounded-xl px-6 font-medium transition-all"
                  >
                    {common.cancel}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-11 gap-2 rounded-xl px-8 font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                  >
                    {isPending && (
                      <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
                    )}
                    <span>{projects.edit.submit}</span>
                  </Button>
                </div>
              )}
            </div>
          </form>
        </Form>
      )}

      {!isProductMode && project ? (
        <div className="mt-10">
          <ProjectStatusesSettings projectId={project.id} />
        </div>
      ) : null}
    </PageTransition>
  );
}
