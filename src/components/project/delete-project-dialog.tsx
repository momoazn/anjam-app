import { DeleteDialog } from "@/components/ui/delete-dialog";
import { projects } from "@/constants";

type Project = {
  id: string;
  name: string;
};

type DeleteProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
};

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
}: DeleteProjectDialogProps) {
  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      entityId={project?.id || null}
      title={projects.delete.title}
      description={projects.delete.confirm}
      collection="projects"
    />
  );
}
