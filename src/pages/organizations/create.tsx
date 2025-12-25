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
import { organization } from "@/constants";
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
      toast.error("لطفاً ابتدا وارد شوید");
      return;
    }

    try {
      // Create the organization
      const org = await pb.collection("organizations").create({
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        owner: currentUser.id,
      });

      // Create the membership (owner)
      await pb.collection("organization_members").create({
        organization: org.id,
        user: currentUser.id,
        role: "owner",
        status: "active",
        joined_at: new Date().toISOString(),
      });

      // Refresh user's organizations
      await fetchUserOrganizations();

      // Switch to the new organization
      await switchOrganization(org.id);

      toast.success(organization.create.success);
      navigate("/");
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
                  <textarea
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                ? "در حال ایجاد..."
                : organization.create.button}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              انصراف
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
