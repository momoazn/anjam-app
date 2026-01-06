import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { useDeleteProject, useDeleteTask, useDeleteUser } from "@/hooks";

type DeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string | null;
  title: string;
  description: string;
  collection: "tasks" | "projects" | "users";
};

export function DeleteDialog({
  open,
  onOpenChange,
  entityId,
  title,
  description,
  collection,
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize hooks without options to ensure compatibility with all hooks
  const deleteTaskMutation = useDeleteTask();
  const deleteProjectMutation = useDeleteProject();
  const deleteUserMutation = useDeleteUser();

  const getMutationForCollection = () => {
    switch (collection) {
      case "tasks":
        return deleteTaskMutation;
      case "projects":
        return deleteProjectMutation;
      case "users":
        return deleteUserMutation;
      default:
        throw new Error(`Unsupported collection: ${collection}`);
    }
  };

  const { mutate: deleteEntity } = getMutationForCollection();

  const handleDelete = async () => {
    if (!entityId) return;

    setIsDeleting(true);
    try {
      // Handle potential async nature of mutations
      await deleteEntity(entityId);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("خطایی رخ داد");
    } finally {
      setIsDeleting(false);
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
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 order-1"
          >
            {isDeleting ? (
              <Loader2 className="text-muted-foreground ms-2 size-4 animate-spin" />
            ) : null}
            {common.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}