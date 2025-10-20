import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TEXT } from "@/constants/text";
import { pb } from "@/lib/pocketbase";
import { useAuthUser } from "@/store/auth-store";
import { Loader2 } from "lucide-react";

const projectFormSchema = z.object({
  name: z.string().min(1, { message: TEXT.projects.create.form.nameRequired }),
  code: z.string().length(3, {
    message: TEXT.projects.create.form.codeLength,
  }),
});

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const queryClient = useQueryClient();
  const user = useAuthUser();
  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: z.infer<typeof projectFormSchema>) => {
      return pb.collection("projects").create({
        ...data,
        code: data.code.toUpperCase(),
        supervisor: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onOpenChange(false);
      form.reset();
      toast.success(TEXT.projects.create.success);
    },
    onError: (error) => {
      toast.error(TEXT.projects.create.error.replace("{error}", error.message));
    },
  });

  function onSubmit(values: z.infer<typeof projectFormSchema>) {
    createProjectMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{TEXT.projects.create.title}</DialogTitle>
          <DialogDescription>
            {TEXT.projects.create.description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{TEXT.projects.create.form.name}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{TEXT.projects.create.form.code}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createProjectMutation.isPending}>
                {createProjectMutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                {TEXT.projects.create.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
