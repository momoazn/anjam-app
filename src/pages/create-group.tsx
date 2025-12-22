import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { auth, common, groups, users } from "@/constants";
import { useCreateGroup, useCreateGroupWithManager, useUsers } from "@/hooks";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";

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

  // Fetch only active managers for manager selection (only managers can be group managers)
  const { data: allUsers } = useUsers({
    filter: 'role = "manager" && active = true',
    sort: "-created",
  });

  // Client-side safety filter: ensure only managers are shown
  const managers = useMemo(() => {
    return (
      allUsers?.filter(
        (user) => user.role === UsersRoleOptions.manager && user.active,
      ) ?? []
    );
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

  return (
    <PageTransition className="container mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/groups")}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{groups.create.title}</h1>
          <p className="text-muted-foreground">{groups.create.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{groups.create.title}</CardTitle>
          <CardDescription>{groups.create.formDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{groups.form.name}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={groups.form.namePlaceholder}
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
                    <FormLabel>{groups.form.description}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={groups.form.descriptionPlaceholder}
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="managerMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{groups.form.managerModeLabel}</FormLabel>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={
                          field.value === "existing" ? "default" : "outline"
                        }
                        onClick={() => {
                          field.onChange("existing");
                          form.setValue("newManager", {
                            username: "",
                            password: "",
                            first_name: "",
                            last_name: "",
                            email: "",
                          });
                        }}
                      >
                        {groups.form.selectExisting}
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "new" ? "default" : "outline"}
                        onClick={() => {
                          field.onChange("new");
                          form.setValue("manager", "");
                        }}
                      >
                        {groups.form.createNew}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("managerMode") === "existing" ? (
                <FormField
                  control={form.control}
                  name="manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{groups.form.manager}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={groups.form.selectManager}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {managers.length === 0 ? (
                            <SelectItem value="__empty" disabled>
                              {common.messages.noData}
                            </SelectItem>
                          ) : (
                            managers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.first_name && user.last_name
                                  ? `${user.first_name} ${user.last_name}`
                                  : user.username}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="newManager.username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{auth.login.username}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newManager.password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{auth.login.password}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newManager.first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{users.form.firstName}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newManager.last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{users.form.lastName}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newManager.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{users.table.columns.email}</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/groups")}
                  disabled={isPendingAny}
                >
                  {common.cancel}
                </Button>
                <Button type="submit" disabled={isPendingAny}>
                  {isPendingAny ? (
                    <Loader2 className="text-muted-foreground mr-2 size-4 animate-spin" />
                  ) : null}
                  {groups.create.button}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
