import { zodResolver } from "@hookform/resolvers/zod";
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ProjectFields } from "@/components/forms/project-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { projects } from "@/constants";
import { useProject, useUpdateProject } from "@/hooks";
import { useCurrentOrgRole } from "@/store/app-context-store";
import {
  useCloseModal,
  useModalData,
  useModalIsOpen,
  useModalType,
} from "@/store/modal-store";

const projectFormSchema = z.object({
  name: z.string().min(1, { message: projects.create.form.nameRequired }),
  code: z.string().optional(),
  description: z.string().optional(),
  supervisor: z.string().optional(),
});

export function EditProjectModal() {
  const isOpen = useModalIsOpen();
  const type = useModalType();
  const closeModal = useCloseModal();
  const data = useModalData();
  const currentOrgRole = useCurrentOrgRole();
  const isAdmin = currentOrgRole === "owner";
  const [isMutationPending, setIsMutationPending] = useState(false);

  const projectId = data?.projectId;

  const { data: project, isLoading: isLoadingProject } = useProject({
    id: projectId ?? "",
    enabled: !!projectId,
  });

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      supervisor: "",
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        code: project.code,
        description: (project.description || "").replace(/<br>/g, "\n"),
        supervisor: project.supervisorUserId || "",
      });
    }
  }, [form, project]);

  const { mutate: updateProject } = useUpdateProject();

  const handleClose = () => {
    closeModal();
    form.reset();
  };

  const handleSubmit = async (values: z.infer<typeof projectFormSchema>) => {
    if (!projectId) return;

    setIsMutationPending(true);
    try {
      await updateProject({
        id: projectId,
        updates: {
          name: values.name,
          description: values.description,
          supervisorUserId: values.supervisor,
        },
      });

      toast.success(projects.edit.success);
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update project");
    } finally {
      setIsMutationPending(false);
    }
  };

  if (type !== "edit-project") return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {project ? `Edit Project: ${project.name}` : projects.edit.title}
          </DialogTitle>
          <DialogDescription>{projects.edit.description}</DialogDescription>
        </DialogHeader>

        {isLoadingProject ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <IconLoader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="max-h-[60vh] overflow-y-auto">
                <ProjectFields
                  control={form.control}
                  codeMode="readonly"
                  showSupervisor={false}
                  isAdmin={isAdmin}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isMutationPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isMutationPending}>
                  {isMutationPending ? (
                    <IconLoader2 className="me-2 size-4 animate-spin" />
                  ) : (
                    <IconDeviceFloppy className="me-2 size-4" />
                  )}
                  {projects.edit.submit}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
