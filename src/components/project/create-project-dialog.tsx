import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientResponseError } from "pocketbase";
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
import { fa } from "@/constants/text";
import { FileWithPreview } from "@/hooks/use-file-upload";
import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/hooks";
import { useAuthUser } from "@/store/auth-store";
import { Loader2 } from "lucide-react";

const projectFormSchema = z.object({
  name: z.string().min(1, { message: fa.projects.create.form.nameRequired }),
  code: z.string().length(3, {
    message: fa.projects.create.form.codeLength,
  }),
  description: z.string().optional(),
  assets: z.array(z.any()).optional(),
  supervisor: z.string().optional(),
});

type CreateProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const user = useAuthUser();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      assets: [],
      supervisor: user?.id || "",
    },
  });

  const { mutate: createProject, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof projectFormSchema>) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("code", data.code.toUpperCase());
      formData.append("supervisor", data.supervisor || user?.id || "");

      if (data.description) {
        // Convert line breaks to HTML
        const descriptionWithBreaks = data.description.replace(/\n/g, "<br>");
        formData.append("description", descriptionWithBreaks);
      }

      if (data.assets && data.assets.length > 0) {
        data.assets.forEach((file: FileWithPreview) => {
          formData.append("assets", file);
        });
      }

      return pb.collection("projects").create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      toast.success(fa.projects.create.success);
      form.reset();
      onOpenChange(false);
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

      toast.error(fa.projects.create.error.replace("{error}", errorMessage));
    },
  });

  function onSubmit(values: z.infer<typeof projectFormSchema>) {
    createProject(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{fa.projects.create.title}</DialogTitle>
          <DialogDescription>
            {fa.projects.create.description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ProjectFields
              control={form.control}
              showSupervisor={true}
              isAdmin={isAdmin}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="text-muted-foreground mr-2 size-4 animate-spin" />
                ) : null}
                {fa.projects.create.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
