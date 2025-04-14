import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TEXT } from "@/constants/text";
import { pb } from "@/lib/pocketbase";
import { ProjectsResponse } from "@/lib/pocketbase-types";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectsResponse | null;
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
}: DeleteProjectDialogProps) {
  const queryClient = useQueryClient();

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => {
      return pb.collection("projects").delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onOpenChange(false);
      toast.success(TEXT.projects.delete.success);
    },
    onError: (error) => {
      toast.error(TEXT.projects.delete.error.replace("{error}", error.message));
    },
  });

  const handleDelete = () => {
    if (project) {
      deleteProjectMutation.mutate(project.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{TEXT.projects.delete.title}</DialogTitle>
          <DialogDescription>{TEXT.projects.delete.confirm}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {TEXT.common.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteProjectMutation.isPending}
          >
            {deleteProjectMutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            {TEXT.projects.delete.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
