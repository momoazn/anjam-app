import { DeleteDialog } from "@/components/ui/delete-dialog";
import { TEXT } from "@/constants/text";
import { UsersResponse } from "@/lib/pocketbase-types";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UsersResponse | null;
}

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
      entityName="user"
      title={TEXT.users.delete.title}
      description={TEXT.users.delete.description}
      collection="users"
      successMessage={TEXT.users.delete.success}
      errorMessage={TEXT.users.delete.error}
      invalidateQueries={["users"]}
    />
  );
}
