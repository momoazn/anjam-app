import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { IconBuilding, IconDeviceFloppy, IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/forms/form-field";
import { organization, shared } from "@/constants";
import { pb } from "@/lib/pocketbase";
import { useCurrentOrganization } from "@/store/auth-store";
import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";

const orgSettingsSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .min(1)
    .max(100),
  description: z.string().optional(),
});

type OrgSettingsForm = z.infer<typeof orgSettingsSchema>;

export function OrgSettingsPage() {
  const navigate = useNavigate();
  const currentOrg = useCurrentOrganization();

  const form = useForm<OrgSettingsForm>({
    resolver: zodResolver(orgSettingsSchema),
    values: currentOrg
      ? {
          name: currentOrg.name,
          slug: currentOrg.slug,
          description:
            ((currentOrg as unknown as Record<string, unknown>)
              .description as string) || "",
        }
      : undefined,
  });

  const onSubmit = async (data: OrgSettingsForm) => {
    if (!currentOrg) {
      toast.error(organization.notFound);
      return;
    }

    try {
      await pb.collection("organizations").update(currentOrg.id, {
        name: data.name,
        slug: data.slug,
        description: data.description || "",
      });

      toast.success(organization.settings.saveSuccess);
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error(organization.settings.saveError);
    }
  };

  if (!currentOrg) {
    return (
      <PageTransition className="container mx-auto py-12">
        <div className="border-border bg-background relative overflow-hidden rounded-lg border p-12 text-center shadow-sm">
          <p className="text-foreground relative z-10 text-lg font-semibold">
            {organization.notFound}
          </p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto max-w-3xl p-4 md:p-6">
      <PageHeader
        title={organization.settings.title}
        description="Manage your organization settings and metadata"
        icon={IconBuilding}
      />

      <div className="mt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <section className="border-border bg-card relative overflow-hidden rounded-lg border p-8 shadow-sm">
              <div className="relative z-10">
                <div className="border-border mb-8 flex items-center gap-4 border-b pb-4">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-md">
                    <IconBuilding className="size-6" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-bold tracking-tight">
                      {organization.settings.general}
                    </h3>
                    <p className="text-muted-foreground text-xs font-medium">
                      General Information
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    label={organization.settings.name}
                    type="input"
                    placeholder={organization.settings.namePlaceholder}
                    required
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    label={organization.settings.slug}
                    type="input"
                    placeholder={organization.settings.slugPlaceholder}
                    required
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    label={organization.settings.description}
                    type="textarea"
                    placeholder={organization.settings.descriptionPlaceholder}
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-row-reverse gap-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="h-11 px-8"
              >
                <IconDeviceFloppy className="me-2 size-5" />
                {form.formState.isSubmitting
                  ? shared.saving
                  : organization.settings.save}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="h-11 px-8"
              >
                <IconX className="me-2 size-5" />
                {shared.cancel}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageTransition>
  );
}
