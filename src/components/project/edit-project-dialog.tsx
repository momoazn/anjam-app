import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TEXT } from "@/constants/text";
import { pb } from "@/lib/pocketbase";
import { ProjectsResponse } from "@/lib/pocketbase-types";

interface ProjectFormData {
  name: string;
  code: string;
}

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectsResponse | null;
}

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
}: EditProjectDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    code: "",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        code: project.code,
      });
    }
  }, [project]);

  const updateProjectMutation = useMutation({
    mutationFn: (data: ProjectFormData) => {
      if (!project) throw new Error("No project selected");
      return pb.collection("projects").update(project.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onOpenChange(false);
      setFormData({ name: "", code: "" });
      toast.success(TEXT.projects.edit.success);
    },
    onError: (error) => {
      toast.error(TEXT.projects.edit.error.replace("{error}", error.message));
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{TEXT.projects.edit.title}</DialogTitle>
          <DialogDescription>
            {TEXT.projects.edit.description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-name">
                {TEXT.projects.create.form.name}
              </label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-code">
                {TEXT.projects.create.form.code}
              </label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={updateProjectMutation.isPending}>
              {updateProjectMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              {TEXT.projects.edit.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
