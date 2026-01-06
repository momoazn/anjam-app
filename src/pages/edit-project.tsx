import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2, IconPencil } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { ProjectFields } from "@/components/forms/project-fields";
import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { common, projects } from "@/constants";
import { useProject, useUpdateProject } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  useAuthUser,
  useCurrentOrgMode,
  useCurrentOrgRole,
} from "@/store/auth-store";

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
  const user = useAuthUser();
  const currentOrgRole = useCurrentOrgRole();
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
  const isAdmin = currentOrgRole === "owner" || currentOrgRole === "admin";
  const [isMutationPending, setIsMutationPending] = useState(false);

  const { data: project, isLoading } = useProject({
    id: id,
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
        supervisor: project.supervisorUserId || "",
      });
    }
  }, [form, project]);

  const { mutate: updateProject } = useUpdateProject();

  async function onSubmit(values: z.infer<typeof projectFormSchema>) {
    if (!id) return;

    setIsMutationPending(true);
    try {
      await updateProject({
        id,
        updates: {
          name: values.name,
          description: values.description,
          supervisorUserId: values.supervisor,
        },
      });

      toast.success(projects.edit.success);
      navigate("/projects");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update project");
    } finally {
      setIsMutationPending(false);
    }
  }

  const handleCancel = () => {
    navigate("/projects");
  };

  const isPending = isMutationPending;

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
                    size="xs"
                    onClick={handleCancel}
                    disabled={isPending}
                  >
                    {common.cancel}
                  </Button>
                  <Button
                    type="submit"
                    size="xs"
                    disabled={isPending}
                    className="gap-2"
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
                    size="sm"
                    onClick={handleCancel}
                    disabled={isPending}
                  >
                    {common.cancel}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="gap-2"
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
    </PageTransition>
  );
}
