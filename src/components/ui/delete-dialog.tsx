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
import { fa } from "@/constants/text";
import { useEntityDeleteMutation } from "@/hooks/use-entity-mutation";
import { Loader2 } from "lucide-react";

type DeleteDialogProps = {
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
};

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
            {fa.common.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 order-1"
          >
            {isPending ? (
              <Loader2 className="ml-2 size-4 animate-spin" />
            ) : null}
            {entityName === "project"
              ? fa.projects.delete.submit
              : `Delete ${entityName}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
