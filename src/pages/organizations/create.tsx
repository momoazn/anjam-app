/* eslint-disable react-hooks/incompatible-library */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { organization, auth, shared } from "@/constants";
import { pb } from "@/lib/pocketbase";
import { useAuthStore } from "@/store/auth-store";

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
  const fetchUserOrganizations = useAuthStore((s) => s.fetchUserOrganizations);

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
      const response = (await pb.send("/api/v1/organizations", {
        method: "POST",
        body: {
          name: data.name,
          description: data.description || "",
        },
      })) as { organization: { id: string } };

      // Refresh user's organizations
      await fetchUserOrganizations();

      // Switch to the new organization
      await switchOrganization(response.organization.id);

      toast.success(organization.create.success);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error(organization.create.error);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-black tracking-tight">
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
