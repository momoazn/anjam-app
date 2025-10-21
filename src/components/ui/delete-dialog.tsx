import { useEntityDeleteMutation } from "@/hooks/use-entity-mutation";
import { Loader2 } from "lucide-react";
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

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string | null;
  entityName: string;
  title: string;
  description: string;
  collection: string;
  successMessage: string;
  errorMessage: string;
  invalidateQueries: string[];
}

export function DeleteDialog({
  open,
  onOpenChange,
  entityId,
  entityName,
  title,
  description,
  collection,
  successMessage,
  errorMessage,
  invalidateQueries,
}: DeleteDialogProps) {
  const { mutate: deleteEntity, isPending } = useEntityDeleteMutation({
    collection,
    successMessage,
    errorMessage,
    invalidateQueries,
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const handleDelete = () => {
    if (entityId) {
      deleteEntity(entityId);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Delete {entityName}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
