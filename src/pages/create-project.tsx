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
import { cn } from "@/lib/utils";
import {
  useAuthUser,
  useCurrentOrgMode,
  useCurrentOrganization,
} from "@/store/auth-store";

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

export default function CreateProject() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const currentOrg = useCurrentOrganization();
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";

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

  const { mutate: createProject, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof projectFormSchema>) => {
      const formData = new FormData();
      formData.append("name", data.name);
      // Only append code if provided (backend will auto-generate if empty)
      if (data.code) {
        formData.append("code", data.code.toUpperCase());
      }
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

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        onClick={handleCancel}
        disabled={isPending}
        className={cn(
          "rounded-lg",
          isProductMode
            ? "h-8 px-3 text-xs font-semibold"
            : "h-11 px-6 font-bold",
        )}
      >
        <IconX className="me-2 size-4" stroke={2.5} />
        {common.cancel}
      </Button>
      <Button
        type="submit"
        disabled={isPending}
        className={cn(
          "shadow-primary/20 rounded-lg",
          isProductMode
            ? "h-8 px-3 text-xs font-semibold shadow-sm"
            : "h-11 px-8 font-bold shadow-lg",
        )}
      >
        {isPending ? (
          <IconLoader2 className="me-2 size-4 animate-spin" stroke={2.5} />
        ) : (
          <IconDeviceFloppy className="me-2 size-4" stroke={2.5} />
        )}
        {projects.create.submit}
      </Button>
    </div>
  );

  return (
    <PageTransition
      className={cn(
        "mx-auto w-full p-4 md:p-6",
        isProductMode ? "max-w-3xl" : "max-w-7xl",
      )}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(isProductMode ? "space-y-4" : "space-y-8")}
        >
          {isProductMode ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 text-right">
                <h1 className="truncate text-base font-semibold">
                  {projects.create.title}
                </h1>
                <p className="text-muted-foreground mt-1 text-xs">
                  {projects.create.description}
                </p>
              </div>
              {headerActions}
            </div>
          ) : (
            <PageHeader
              title={projects.create.title}
              description={projects.create.description}
              icon={IconStack2}
            />
          )}

          <div
            className={cn(
              "rounded-xl border border-border/40",
              isProductMode
                ? "bg-background/30 p-4 shadow-none"
                : "bg-card p-6 shadow-sm",
            )}
          >
            {!isProductMode ? (
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
            ) : null}

            <ProjectFields
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={form.control as any}
              codeMode={isProductMode ? "hidden" : "editable"}
              showSupervisor={!isProductMode}
              isAdmin={isAdmin}
            />
          </div>

          {isProductMode ? null : (
            <div className="flex items-center justify-end gap-3">
              {headerActions}
            </div>
          )}
        </form>
      </Form>
    </PageTransition>
  );
}
