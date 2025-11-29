import { DeleteDialog } from "@/components/ui/delete-dialog";
import { fa } from "@/constants/text";
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
    ? fa.groups.delete.description.replace("{name}", group.name)
    : fa.groups.delete.description;

  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      entityId={group?.id || null}
      title={fa.groups.delete.title}
      description={description}
      collection="groups"
    />
  );
}
