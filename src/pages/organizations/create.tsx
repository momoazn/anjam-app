import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation as useConvexMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { auth, organization, shared } from "@/constants";
import { api } from "@/lib/convex";
import { logError } from "@/lib/logger";
import { useAuthStore } from "@/store/auth-store";

const createOrgSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
});

type CreateOrgForm = z.infer<typeof createOrgSchema>;

export function CreateOrganizationPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const switchOrganization = useAuthStore((s) => s.switchOrganization);
  const createOrg = useConvexMutation(api.organizations.create);

  const form = useForm<CreateOrgForm>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreateOrgForm) => {
    if (!currentUser) {
      toast.error(auth.errors.notLoggedIn);
      return;
    }

    try {
      const orgId = await createOrg({
        name: data.name,
        description: data.description || "",
      });
      await switchOrganization(orgId);

      toast.success(organization.create.success);
      navigate("/projects");
    } catch (error) {
      logError("Error creating organization", error);
      toast.error(organization.create.error);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          {organization.create.title}
        </h1>
        <p className="text-muted-foreground">
          {organization.create.description}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{organization.settings.name}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={organization.settings.namePlaceholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{organization.settings.description}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={organization.settings.descriptionPlaceholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? shared.creating
                : organization.create.button}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              {shared.cancel}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
