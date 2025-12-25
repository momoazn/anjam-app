import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconLoader2, IconPencil } from "@tabler/icons-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { ProjectFields } from "@/components/forms/project-fields";
import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { ProjectStatusesSettings } from "@/components/project/project-statuses-settings";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { common, errors, projects } from "@/constants";
import { queryKeys } from "@/hooks";
import { FileWithPreview } from "@/hooks/use-file-upload";
import { handlePocketBaseError } from "@/lib/error-handler";
import { pb } from "@/lib/pocketbase";
import { ProjectsResponse } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";

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
    <PageTransition className="container mx-auto max-w-4xl p-4 md:p-6">
      <PageHeader
        title={projects.edit.title}
        description={`Registry modification protocol for node :: ${project?.name || id}`}
        icon={IconPencil}
        nodeId={`Project_Configuration :: ${project?.code || "???"}`}
      />

      <div className="bg-muted/5 border-border/40 border p-8 shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-20">
            <IconLoader2 className="h-12 w-12 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <ProjectFields
                control={form.control}
                showSupervisor={true}
                isAdmin={isAdmin}
              />

              <div className="border-border/20 flex items-center justify-end gap-3 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="border-border/40 h-12 rounded-none text-[10px] font-black tracking-widest uppercase"
                >
                  {common.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-12 gap-3 rounded-none px-8 font-black shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 dark:shadow-[-4px_4px_0px_0px_rgba(255,255,255,0.1)]"
                >
                  {isPending && (
                    <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
                  )}
                  <span className="tracking-widest uppercase">
                    {projects.edit.submit}
                  </span>
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>

      {project && (
        <div className="mt-10">
          <ProjectStatusesSettings projectId={project.id} />
        </div>
      )}
    </PageTransition>
  );
}
