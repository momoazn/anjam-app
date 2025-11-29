import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { ProjectFields } from "@/components/forms/project-fields";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { fa } from "@/constants/text";
import { queryKeys } from "@/hooks";
import { FileWithPreview } from "@/hooks/use-file-upload";
import { handlePocketBaseError } from "@/lib/error-handler";
import { pb } from "@/lib/pocketbase";
import { useAuthUser } from "@/store/auth-store";

const projectFormSchema = z.object({
  name: z.string().min(1, { message: fa.projects.create.form.nameRequired }),
  code: z.string().min(1, {
    message: fa.projects.create.form.codeRequired,
  }),
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
      supervisor: user?.id || "",
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
      navigate("/projects");
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });

  function onSubmit(values: z.infer<typeof projectFormSchema>) {
    createProject(values);
  }

  return (
    <PageTransition className="container mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{fa.projects.create.title}</h1>
          <p className="text-muted-foreground">
            {fa.projects.create.description}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{fa.projects.create.title}</CardTitle>
          <CardDescription>{fa.projects.create.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ProjectFields
                control={form.control}
                showSupervisor={true}
                showGroup={true}
                isAdmin={isAdmin}
                isManager={isManager}
              />
              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/projects")}
                  disabled={isPending}
                >
                  {fa.common.cancel}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="text-muted-foreground mr-2 size-4 animate-spin" />
                  ) : null}
                  {fa.projects.create.submit}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
