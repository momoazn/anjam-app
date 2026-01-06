/* eslint-disable react-hooks/incompatible-library */
import { zodResolver } from "@hookform/resolvers/zod";
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
import { logError } from "@/lib/logger";
import { useAuthStore } from "@/store/auth-store";
import { useMutation as useConvexMutation } from "convex/react";
import { api } from "@/lib/convex";

const createOrgSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .min(1)
    .max(100),
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
      slug: "",
      description: "",
    },
  });

  const nameValue = form.watch("name");

  // Auto-generate slug from name
  form.watch((value, { name }) => {
    if (name === "name" && value.name) {
      const slug = value.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      form.setValue("slug", slug);
    }
  });

  const onSubmit = async (data: CreateOrgForm) => {
    if (!currentUser) {
      toast.error(auth.errors.notLoggedIn);
      return;
    }

    try {
      const orgId = await createOrg({
        name: data.name,
        slug: data.slug,
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
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{organization.settings.slug}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={organization.settings.slugPlaceholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-muted-foreground mt-1 text-xs">
                  {organization.settings.slugHelper}: /org/{nameValue || "slug"}
                </p>
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
