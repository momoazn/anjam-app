import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { fa } from "@/constants/text";
import { ProjectsResponse } from "@/lib/pocketbase-types";
import { useEntityUpdateMutation } from "@/hooks/use-entity-mutation";
import { ProjectFields } from "@/components/forms/project-fields";
import { Loader2 } from "lucide-react";

const projectFormSchema = z.object({
  name: z.string().min(1, { message: fa.projects.create.form.nameRequired }),
  code: z.string().length(3, {
    message: fa.projects.create.form.codeLength,
  }),
});

type EditProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectsResponse | null;
};

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
}: EditProjectDialogProps) {
  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        code: project.code,
      });
    }
  }, [form, project]);

  const { mutate: updateProject, isPending } = useEntityUpdateMutation({
    collection: "projects",
    successMessage: fa.projects.edit.success,
    errorMessage: fa.projects.edit.error,
    invalidateQueries: ["projects"],
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
    },
  });

  function onSubmit(values: z.infer<typeof projectFormSchema>) {
    if (!project) return;
    updateProject({ id: project.id, updates: values });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{fa.projects.edit.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ProjectFields control={form.control} />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                {fa.projects.edit.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
