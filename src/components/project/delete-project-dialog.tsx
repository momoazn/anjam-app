import { DeleteDialog } from "@/components/ui/delete-dialog";
import { projects } from "@/constants";
import { ProjectsResponse } from "@/lib/pocketbase-types";

type DeleteProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectsResponse | null;
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
