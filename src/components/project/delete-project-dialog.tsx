import { DeleteDialog } from "@/components/ui/delete-dialog";
import { fa } from "@/constants/text";
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
      title={fa.projects.delete.title}
      description={fa.projects.delete.confirm}
      collection="projects"
      successMessage={fa.projects.delete.success}
      errorMessage={fa.projects.delete.error}
      invalidateQueries={["projects"]}
    />
  );
}
