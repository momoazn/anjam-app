import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconLoader2,
  IconBuildingCommunity,
  IconChevronRight,
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { auth, common, groups, users as usersConst } from "@/constants";
import { useCreateGroup, useCreateGroupWithManager, useUsers } from "@/hooks";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";
import { FormField as GenericFormField } from "@/components/forms/form-field";
import { cn } from "@/lib/utils";

const managerSchema = z.object({
  username: z.string().min(1, { message: common.validation.required }),
  password: z.string().min(8, { message: auth.errors.passwordMinLength }),
  first_name: z.string().min(1, { message: auth.errors.firstNameRequired }),
  last_name: z.string().min(1, { message: auth.errors.lastNameRequired }),
  email: z.string().optional().or(z.literal("")),
});

const formSchema = z
  .object({
    name: z.string().min(2, { message: common.validation.required }),
    description: z.string().optional(),
    managerMode: z.enum(["existing", "new"]),
    manager: z.string().optional(),
    newManager: managerSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.managerMode === "existing") {
      if (!data.manager || data.manager.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: common.validation.required,
          path: ["manager"],
        });
      }
      return;
    }

    if (!data.newManager) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: common.validation.required,
        path: ["newManager"],
      });
    }
  });

export default function CreateGroup() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const isAdmin = user?.role === UsersRoleOptions.admin;

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
    defaultValues: {
      name: "",
      description: "",
      managerMode: "existing",
      manager: "",
      newManager: {
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
      },
    },
  });

  const { mutate: createGroup, isPending } = useCreateGroup({
    onSuccess: () => {
      toast.success(groups.create.success);
      navigate("/groups");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : groups.create.error);
    },
  });

  const { mutate: createGroupWithManager, isPending: isPendingBootstrap } =
    useCreateGroupWithManager({
      onSuccess: () => {
        toast.success(groups.create.success);
        navigate("/groups");
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : groups.create.error,
        );
      },
    });

  const isPendingAny = isPending || isPendingBootstrap;

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.managerMode === "existing") {
      createGroup({
        name: values.name,
        description: values.description || "",
        manager: values.manager!,
        active: true,
      });
      return;
    }

    createGroupWithManager({
      group: { name: values.name, description: values.description || "" },
      manager: {
        username: values.newManager!.username.trim().toLowerCase(),
        password: values.newManager!.password.trim(),
        first_name: values.newManager!.first_name.trim(),
        last_name: values.newManager!.last_name.trim(),
        email: values.newManager!.email?.trim().toLowerCase() || undefined,
      },
    });
  }

  if (!isAdmin) {
    navigate("/groups");
    return null;
  }

  const managerMode = form.watch("managerMode");

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
          title={groups.create.title}
          description={groups.create.description}
          icon={IconBuildingCommunity}
          nodeId="Organization_Provisioning"
        />
      </div>

      <div className="bg-muted/5 border-border/40 border p-8 shadow-sm">
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
                  02_Managerial_Protocol
                </span>
                <div className="bg-border/20 h-px flex-1" />
              </div>

              <div className="space-y-8">
                <div className="bg-border/40 border-border/40 flex gap-px overflow-hidden border shadow-sm">
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "h-12 flex-1 rounded-none text-[10px] font-black tracking-widest uppercase transition-all",
                      managerMode === "existing"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground/60 hover:bg-muted/30",
                    )}
                    onClick={() => {
                      form.setValue("managerMode", "existing");
                      form.setValue("newManager", {
                        username: "",
                        password: "",
                        first_name: "",
                        last_name: "",
                        email: "",
                      });
                    }}
                  >
                    <IconUser className="ml-2 size-4" />
                    {groups.form.selectExisting}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "h-12 flex-1 rounded-none text-[10px] font-black tracking-widest uppercase transition-all",
                      managerMode === "new"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground/60 hover:bg-muted/30",
                    )}
                    onClick={() => {
                      form.setValue("managerMode", "new");
                      form.setValue("manager", "");
                    }}
                  >
                    <IconUserPlus className="ml-2 size-4" />
                    {groups.form.createNew}
                  </Button>
                </div>

                {managerMode === "existing" ? (
                  <div className="bg-card border-border/40 animate-in fade-in slide-in-from-top-2 border p-6">
                    <GenericFormField
                      control={form.control}
                      name="manager"
                      label={groups.form.manager}
                      type="select"
                      options={managers}
                      placeholder={groups.form.selectManager}
                    />
                  </div>
                ) : (
                  <div className="bg-card border-border/40 animate-in fade-in slide-in-from-top-2 space-y-6 border p-6 text-right">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <GenericFormField
                        control={form.control}
                        name="newManager.first_name"
                        label={usersConst.form.firstName}
                        type="input"
                        required
                      />
                      <GenericFormField
                        control={form.control}
                        name="newManager.last_name"
                        label={usersConst.form.lastName}
                        type="input"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <GenericFormField
                        control={form.control}
                        name="newManager.username"
                        label={auth.login.username}
                        type="input"
                        required
                      />
                      <GenericFormField
                        control={form.control}
                        name="newManager.password"
                        label={auth.login.password}
                        type="input"
                        required
                        placeholder="••••••••"
                      />
                    </div>
                    <GenericFormField
                      control={form.control}
                      name="newManager.email"
                      label={usersConst.table.columns.email}
                      type="input"
                    />
                  </div>
                )}
              </div>
            </section>

            <div className="border-border/20 flex items-center justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/groups")}
                disabled={isPendingAny}
                className="border-border/40 h-12 rounded-none text-[10px] font-black tracking-widest uppercase"
              >
                {common.cancel}
              </Button>
              <Button
                type="submit"
                disabled={isPendingAny}
                className="h-12 gap-3 rounded-none px-8 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
              >
                {isPendingAny && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <span className="tracking-widest uppercase">
                  {groups.create.button}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageTransition>
  );
}
