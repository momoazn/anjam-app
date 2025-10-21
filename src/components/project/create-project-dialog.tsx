import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { TEXT } from "@/constants/text";
import { useEntityMutation } from "@/hooks/use-entity-mutation";
import { ProjectFields } from "@/components/forms/project-fields";
import { useAuthUser } from "@/store/auth-store";
import { Loader2 } from "lucide-react";

const projectFormSchema = z.object({
  name: z.string().min(1, { message: TEXT.projects.create.form.nameRequired }),
  code: z.string().length(3, {
    message: TEXT.projects.create.form.codeLength,
  }),
});

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const user = useAuthUser();
  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  const { mutate: createProject, isPending } = useEntityMutation({
    collection: "projects",
    successMessage: TEXT.projects.create.success,
    errorMessage: TEXT.projects.create.error,
    invalidateQueries: ["projects"],
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
    },
  });

  function onSubmit(values: z.infer<typeof projectFormSchema>) {
    createProject({
      ...values,
      code: values.code.toUpperCase(),
      supervisor: user?.id,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{TEXT.projects.create.title}</DialogTitle>
          <DialogDescription>
            {TEXT.projects.create.description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ProjectFields control={form.control} />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                {TEXT.projects.create.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
