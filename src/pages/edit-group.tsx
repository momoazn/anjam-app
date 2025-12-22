import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { common, groups } from "@/constants";
import { useGroup, useUpdateGroup, useUsers } from "@/hooks";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { handlePocketBaseError } from "@/lib/error-handler";
import { useAuthUser } from "@/store/auth-store";

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
    );
  }, [allUsers]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { name: "", description: "", manager: "" },
  });

  useEffect(() => {
    if (!group) return;
    form.reset({
      name: group.name,
      description: group.description || "",
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
    <PageTransition className="container mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/groups")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{groups.edit.title}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{groups.edit.title}</CardTitle>
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
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{groups.form.manager}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                          managers.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.first_name && m.last_name
                                ? `${m.first_name} ${m.last_name}`
                                : m.username}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/groups")}
                  disabled={isPending}
                >
                  {common.cancel}
                </Button>
                <Button type="submit" disabled={isPending || isLoading}>
                  {isPending ? (
                    <Loader2 className="text-muted-foreground mr-2 size-4 animate-spin" />
                  ) : null}
                  {groups.edit.button}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
