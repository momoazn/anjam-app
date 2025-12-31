import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconDeviceFloppy,
  IconLoader2,
  IconStack2,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { ProjectFields } from "@/components/forms/project-fields";
import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { common, projects } from "@/constants";
import { queryKeys } from "@/hooks";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import { handlePocketBaseError } from "@/lib/error-handler";
import { pb } from "@/lib/pocketbase";
import { useAuthUser, useCurrentOrganization } from "@/store/auth-store";

const projectFormSchema = z.object({
  name: z.string().min(1, { message: projects.create.form.nameRequired }),
  code: z
    .string()
    .min(1, {
      message: projects.create.form.codeRequired,
    })
    .length(3, {
      message: "Code must be exactly 3 characters",
    })
    .regex(/^[A-Za-z]+$/, {
      message:
        "Code must contain only letters (no numbers or special characters)",
    })
    .transform((val) => val.toUpperCase()),
  description: z.string().optional(),
  assets: z.array(z.instanceof(File)).optional(),
  supervisor: z.string().optional(),
});

export default function CreateProject() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const currentOrg = useCurrentOrganization();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      assets: [],
      supervisor: undefined,
    },
  });

  const { mutate: createProject, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof projectFormSchema>) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("code", data.code.toUpperCase());
      formData.append("supervisor", data.supervisor || user?.id || "");

      if (currentOrg?.id) {
        formData.append("organization", currentOrg.id);
      }

      if (data.description) {
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
      toast.success(projects.create.success);
      navigate("/projects");
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });

  function onSubmit(values: z.infer<typeof projectFormSchema>) {
    createProject(values);
  }

  const handleCancel = () => {
    navigate("/projects");
  };

  return (
    <PageTransition className="container mx-auto max-w-4xl p-4 md:p-6">
      <PageHeader
        title={projects.create.title}
        description={projects.create.description}
        icon={IconStack2}
      />

      <div className="mt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="mb-8 flex items-center gap-4 border-b pb-6">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                  <IconStack2 className="size-6" stroke={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {projects.details.information}
                  </h3>
                  <p className="text-muted-foreground text-xs font-medium">
                    {projects.create.form.description}
                  </p>
                </div>
              </div>

              <ProjectFields
                control={form.control}
                showSupervisor={true}
                isAdmin={isAdmin}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={isPending}
                className="h-11 rounded-lg px-6 font-bold"
              >
                <IconX className="me-2 size-4" stroke={2.5} />
                {common.cancel}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="shadow-primary/20 h-11 rounded-lg px-8 font-bold shadow-lg"
              >
                {isPending ? (
                  <IconLoader2
                    className="me-2 size-4 animate-spin"
                    stroke={2.5}
                  />
                ) : (
                  <IconDeviceFloppy className="me-2 size-4" stroke={2.5} />
                )}
                {projects.create.submit}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageTransition>
  );
}
