import { zodResolver } from "@hookform/resolvers/zod";
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
import { useCreateProject } from "@/hooks";
import {
  useAuthUser,
  useCurrentOrgRole,
  useCurrentOrganization,
} from "@/store/app-context-store";
import { useCloseModal, useModalIsOpen } from "@/store/modal-store";

const projectFormSchema = z.object({
  name: z.string().min(1, { message: projects.create.form.nameRequired }),
  code: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^[A-Za-z]{3}$/.test(val), {
      message: "Code must be exactly 3 letters",
    }),
  description: z.string().optional(),
  assets: z.array(z.instanceof(File)).optional(),
  supervisor: z.string().optional(),
});

export function CreateProjectModal() {
  const isOpen = useModalIsOpen();
  const closeModal = useCloseModal();
  const navigate = useNavigate();
  const user = useAuthUser();
  const currentOrg = useCurrentOrganization();
  const currentOrgRole = useCurrentOrgRole();
  const isAdmin = currentOrgRole === "owner";
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      code: undefined,
      description: "",
      assets: [],
      supervisor: undefined,
    },
  });

  const { mutate: createProject } = useCreateProject();

  const handleClose = (open: boolean) => {
    if (!open) {
      navigate(-1);
    }
  };

  const handleSubmit = async (values: z.infer<typeof projectFormSchema>) => {
    if (!currentOrg?._id) {
      toast.error("No organization selected");
      return;
    }

    setIsPending(true);
    try {
      await createProject({
        name: values.name,
        description: values.description,
        supervisorUserId: values.supervisor || user?._id,
        organizationId: currentOrg._id,
      });

      toast.success(projects.create.success);
      form.reset();
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{projects.create.title}</DialogTitle>
          <DialogDescription>{projects.create.description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="max-h-[60vh] overflow-y-auto">
              <ProjectFields
                control={form.control}
                codeMode="hidden"
                showSupervisor={false}
                isAdmin={isAdmin}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <IconLoader2 className="me-2 size-4 animate-spin" />
                ) : (
                  <IconDeviceFloppy className="me-2 size-4" />
                )}
                {projects.create.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
