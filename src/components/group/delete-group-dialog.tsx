import { DeleteDialog } from "@/components/ui/delete-dialog";
import { groups } from "@/constants";
import { GroupsResponse } from "@/lib/pocketbase-types";

type DeleteGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GroupsResponse | null;
};

export function DeleteGroupDialog({
  open,
  onOpenChange,
  group,
}: DeleteGroupDialogProps) {
  const description = group
    ? groups.delete.description.replace("{name}", group.name)
    : groups.delete.description;

  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      entityId={group?.id || null}
      title={groups.delete.title}
      description={description}
      collection="groups"
    />
  );
}
