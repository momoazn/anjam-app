import { DeleteDialog } from "@/components/ui/delete-dialog";
import { fa } from "@/constants/text";
import { UsersResponse } from "@/lib/pocketbase-types";

type DeleteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UsersResponse | null;
};

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
}: DeleteUserDialogProps) {
  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      entityId={user?.id || null}
      title={fa.users.delete.title}
      description={fa.users.delete.description}
      collection="users"
    />
  );
}
