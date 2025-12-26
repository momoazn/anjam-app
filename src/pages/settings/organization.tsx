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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { organization, shared } from "@/constants";
import { pb } from "@/lib/pocketbase";
import { useCurrentOrganization } from "@/store/auth-store";

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
      <div className="container mx-auto py-12">
        <p className="text-muted-foreground text-center">
          {organization.notFound}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-black tracking-tight">
          {organization.settings.title}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {organization.settings.general}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        placeholder={
                          organization.settings.descriptionPlaceholder
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? shared.saving
                : organization.settings.save}
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
