import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
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
import { fa } from "@/constants/text";
import { useCreateGroup, useUsers } from "@/hooks";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";

const formSchema = z.object({
  name: z.string().min(2, { message: fa.common.validation.required }),
  description: z.string().optional(),
  manager: z.string().min(1, { message: fa.common.validation.required }),
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
      manager: "",
    },
  });

  const { mutate: createGroup, isPending } = useCreateGroup({
    onSuccess: () => {
      toast.success(fa.groups.create.success);
      navigate("/groups");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createGroup({
      name: values.name,
      description: values.description || "",
      manager: values.manager,
      active: true,
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
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{fa.groups.create.title}</h1>
          <p className="text-muted-foreground">
            {fa.groups.create.description}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{fa.groups.create.title}</CardTitle>
          <CardDescription>{fa.groups.create.formDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{fa.groups.form.name}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={fa.groups.form.namePlaceholder}
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
                    <FormLabel>{fa.groups.form.description}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={fa.groups.form.descriptionPlaceholder}
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
                    <FormLabel>{fa.groups.form.manager}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={fa.groups.form.selectManager}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {managers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : user.username}
                          </SelectItem>
                        ))}
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
                  {fa.common.cancel}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="text-muted-foreground mr-2 size-4 animate-spin" />
                  ) : null}
                  {fa.groups.create.button}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
