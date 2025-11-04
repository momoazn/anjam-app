import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClientResponseError } from "pocketbase";

import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/store/auth-store";
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
import { ProjectFields } from "@/components/forms/project-fields";
import { Loader2 } from "lucide-react";
import { pb } from "@/lib/pocketbase";
import { FileWithPreview } from "@/hooks/use-file-upload";
import { queryKeys } from "@/hooks";

const projectFormSchema = z.object({
  name: z.string().min(1, { message: fa.projects.create.form.nameRequired }),
  code: z.string().length(3, {
    message: fa.projects.create.form.codeLength,
  }),
  description: z.string().optional(),
  assets: z.array(z.any()).optional(),
  supervisor: z.string().optional(),
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
  const queryClient = useQueryClient();
  const user = useAuthUser();
  const isAdmin = user?.role === "admin";

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

      toast.error(fa.projects.edit.error.replace("{error}", errorMessage));
    },
  });

  function onSubmit(values: z.infer<typeof projectFormSchema>) {
    updateProject(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{fa.projects.edit.title}</DialogTitle>
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
                {fa.projects.edit.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
