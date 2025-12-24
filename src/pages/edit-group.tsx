import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2, IconChevronRight, IconPencil } from "@tabler/icons-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { common, groups } from "@/constants";
import { useGroup, useUpdateGroup, useUsers } from "@/hooks";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { handlePocketBaseError } from "@/lib/error-handler";
import { useAuthUser } from "@/store/auth-store";
import { FormField as GenericFormField } from "@/components/forms/form-field";

const formSchema = z.object({
  name: z.string().min(2, { message: common.validation.required }),
  description: z.string().optional(),
  manager: z.string().min(1, { message: common.validation.required }),
});

export default function EditGroup() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = useAuthUser();
  const isAdmin = user?.role === UsersRoleOptions.admin;

  const { data: group, isLoading } = useGroup({
    id: id || "",
    enabled: Boolean(id),
  });

  const { data: allUsers } = useUsers({
    filter: 'role = "manager" && active = true',
    sort: "-created",
  });

  const managers = useMemo(() => {
    return (
      allUsers?.filter(
        (u) => u.role === UsersRoleOptions.manager && u.active,
      ) ?? []
    ).map((u) => ({
      value: u.id,
      label:
        u.first_name && u.last_name
          ? `${u.first_name} ${u.last_name}`
          : u.username,
    }));
  }, [allUsers]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: { name: "", description: "", manager: "" },
  });

  useEffect(() => {
    if (!group) return;
    form.reset({
      name: group.name,
      description: (group.description || "").replace(/<br>/g, "\n"),
      manager: group.manager || "",
    });
  }, [group, form]);

  const { mutate: updateGroup, isPending } = useUpdateGroup({
    onSuccess: () => {
      toast.success(groups.edit.success);
      navigate("/groups");
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!id) return;
    updateGroup({
      id,
      updates: {
        name: values.name.trim(),
        description: values.description?.trim() || "",
        manager: values.manager,
      },
    });
  }

  if (!isAdmin) {
    return <Navigate to="/groups" replace />;
  }

  if (!group && !isLoading) {
    return <Navigate to="/groups" replace />;
  }

  return (
    <PageTransition className="container mx-auto max-w-4xl p-4 md:p-6">
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/groups")}
          className="group text-muted-foreground/40 hover:text-primary gap-2 p-0 text-[10px] font-black tracking-[0.3em] uppercase transition-all"
        >
          <IconChevronRight className="size-3" />
          Back_To_Registry
        </Button>

        <PageHeader
          title={groups.edit.title}
          description={`Modifying protocol for organization node :: ${group?.name || id}`}
          icon={IconPencil}
          nodeId="Organization_Configuration"
        />
      </div>

      <div className="bg-muted/5 border-border/40 border p-8 shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-20">
            <IconLoader2 className="h-12 w-12 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-primary/60 text-[10px] font-black tracking-[0.3em] uppercase">
                    01_Organization_Identity
                  </span>
                  <div className="bg-border/20 h-px flex-1" />
                </div>

                <div className="space-y-6">
                  <GenericFormField
                    control={form.control}
                    name="name"
                    label={groups.form.name}
                    type="input"
                    placeholder="Organization_Unit_Name"
                    required
                  />

                  <GenericFormField
                    control={form.control}
                    name="description"
                    label={groups.form.description}
                    type="textarea"
                    placeholder="Unit_Mission_Description"
                  />
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-primary/60 text-[10px] font-black tracking-[0.3em] uppercase">
                    02_Managerial_Assignment
                  </span>
                  <div className="bg-border/20 h-px flex-1" />
                </div>

                <GenericFormField
                  control={form.control}
                  name="manager"
                  label={groups.form.manager}
                  type="select"
                  options={managers}
                  placeholder={groups.form.selectManager}
                />
              </section>

              <div className="border-border/20 flex items-center justify-end gap-3 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/groups")}
                  disabled={isPending}
                  className="border-border/40 h-12 rounded-none text-[10px] font-black tracking-widest uppercase"
                >
                  {common.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-12 gap-3 rounded-none px-8 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
                >
                  {isPending && (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <span className="tracking-widest uppercase">
                    {groups.edit.button}
                  </span>
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </PageTransition>
  );
}
