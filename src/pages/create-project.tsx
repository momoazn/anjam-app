import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconLoader2, IconStack2 } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { ProjectFields } from "@/components/forms/project-fields";
import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { common, projects } from "@/constants";
import { queryKeys } from "@/hooks";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import { handlePocketBaseError } from "@/lib/error-handler";
import { pb } from "@/lib/pocketbase";
import { useAuthUser } from "@/store/auth-store";

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
  group: z.string().optional(),
});

export default function CreateProject() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      assets: [],
      supervisor: undefined,
      group: isManager && user?.group ? user.group : undefined,
    },
  });

  const { mutate: createProject, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof projectFormSchema>) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("code", data.code.toUpperCase());
      formData.append("supervisor", data.supervisor || user?.id || "");

      if (data.group) {
        formData.append("group", data.group);
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
        nodeId="Project_Initiation"
      />

      <div className="bg-muted/5 border-border/40 border p-8 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <ProjectFields
              control={form.control}
              showSupervisor={true}
              showGroup={true}
              isAdmin={isAdmin}
              isManager={isManager}
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
                  {projects.create.submit}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageTransition>
  );
}
