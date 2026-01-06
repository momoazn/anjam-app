import { DeleteDialog } from "@/components/ui/delete-dialog";
import { users } from "@/constants";
import type { UserWithCompatibility } from "@/types/user";

type DeleteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithCompatibility | null;
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
      title={users.delete.title}
      description={users.delete.description}
      collection="users"
    />
  );
}
