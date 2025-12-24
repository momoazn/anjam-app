import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { common } from "@/constants";
import {
  useDeleteTask,
  useDeleteProject,
  useDeleteUser,
  useDeleteGroup,
} from "@/hooks";
import { Loader2 } from "lucide-react";

type DeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string | null;
  title: string;
  description: string;
  collection: "tasks" | "projects" | "users" | "groups";
};

export function DeleteDialog({
  open,
  onOpenChange,
  entityId,
  title,
  description,
  collection,
}: DeleteDialogProps) {
  const deleteTaskMutation = useDeleteTask({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const deleteProjectMutation = useDeleteProject({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const deleteUserMutation = useDeleteUser({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const deleteGroupMutation = useDeleteGroup({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const getMutationForCollection = () => {
    switch (collection) {
      case "tasks":
        return deleteTaskMutation;
      case "projects":
        return deleteProjectMutation;
      case "users":
        return deleteUserMutation;
      case "groups":
        return deleteGroupMutation;
      default:
        throw new Error(`Unsupported collection: ${collection}`);
    }
  };

  const { mutate: deleteEntity, isPending } = getMutationForCollection();

  const handleDelete = () => {
    if (entityId) {
      deleteEntity(entityId);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="text-right">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-right text-lg font-bold">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-right">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse sm:justify-start">
          <AlertDialogCancel className="order-2">
            {common.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 order-1"
          >
            {isPending ? (
              <Loader2 className="text-muted-foreground ml-2 size-4 animate-spin" />
            ) : null}
            {common.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
