import { IconLoader2, IconTrash } from "@tabler/icons-react";
import type { ReactNode } from "react";

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

type DeleteConfirmationDialogProps = {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Title of the dialog */
  title: string;
  /** Description/warning message */
  description: string | ReactNode;
  /** Callback when user confirms deletion */
  onConfirm: () => void | Promise<void>;
  /** Whether the delete action is in progress */
  isLoading?: boolean;
  /** Custom confirm button text (defaults to "حذف") */
  confirmText?: string;
  /** Custom cancel button text (defaults to "انصراف") */
  cancelText?: string;
  /** Show icon in header (defaults to true) */
  showIcon?: boolean;
  /** Custom icon (defaults to IconTrash) */
  icon?: ReactNode;
};

/**
 * A reusable delete confirmation dialog with rose-colored destructive styling.
 *
 * @example
 * ```tsx
 * <DeleteConfirmationDialog
 *   open={showDeleteDialog}
 *   onOpenChange={setShowDeleteDialog}
 *   title="حذف کاربر"
 *   description="آیا از حذف این کاربر اطمینان دارید؟ این عمل قابل بازگشت نیست."
 *   onConfirm={handleDelete}
 *   isLoading={isDeleting}
 * />
 * ```
 */
export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading = false,
  confirmText = common.delete,
  cancelText = common.cancel,
  showIcon = true,
  icon,
}: DeleteConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-border rounded-2xl border shadow-lg">
        <AlertDialogHeader>
          {showIcon && (
            <div className="mb-2 flex items-center gap-3 text-rose-500">
              {icon ?? <IconTrash className="size-5" />}
              <AlertDialogTitle className="text-xl font-bold tracking-tight">
                {title}
              </AlertDialogTitle>
            </div>
          )}
          {!showIcon && (
            <AlertDialogTitle className="text-xl font-bold tracking-tight">
              {title}
            </AlertDialogTitle>
          )}
          <AlertDialogDescription className="text-sm font-bold opacity-70">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-2">
          <AlertDialogCancel
            disabled={isLoading}
            className="border-border rounded-xl border text-sm font-medium"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="border-border rounded-xl border bg-rose-500 text-sm font-medium text-white shadow-md hover:bg-rose-600 active:shadow-none"
          >
            {isLoading && <IconLoader2 className="me-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
