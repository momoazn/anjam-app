import { DeleteDialog } from "@/components/ui/delete-dialog";
import { TEXT } from "@/constants/text";
import { ProjectsResponse } from "@/lib/pocketbase-types";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectsResponse | null;
}

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
      entityName="project"
      title={TEXT.projects.delete.title}
      description={TEXT.projects.delete.confirm}
      collection="projects"
      successMessage={TEXT.projects.delete.success}
      errorMessage={TEXT.projects.delete.error}
      invalidateQueries={["projects"]}
    />
  );
}
