import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { projects } from "@/constants";
import { useDeleteProject } from "@/hooks";

type Project = {
  id: string;
  name: string;
};

type DeleteProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSuccess?: () => void;
};

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: DeleteProjectDialogProps) {
  const deleteProject = useDeleteProject({
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
      toast.success(projects.delete.success);
    },
  });

  const handleConfirm = async () => {
    if (!project) return;
    await deleteProject.mutate(project.id);
  };

  return (
    <DeleteConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={projects.delete.title}
      description={projects.delete.confirm}
      onConfirm={handleConfirm}
      isLoading={deleteProject.isPending}
    />
  );
}
