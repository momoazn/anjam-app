import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ProjectListGroup } from "@/components/project/project-list-group";
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
import { ProjectsResponse, UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthStore } from "@/store/auth-store";

interface ProjectFormData {
  name: string;
  code: string;
}

export default function Projects() {
  const user = useAuthStore().user;
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectsResponse | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    code: "",
  });

  const { data: userProjects, isPending: isLoadingProjects } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: () => {
      return pb.collection("projects").getFullList<ProjectsResponse>({
        batch: 100,
      });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: ProjectFormData) => {
      return pb.collection("projects").create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsCreateOpen(false);
      setFormData({ name: "", code: "" });
      toast.success(TEXT.projects.create.success);
    },
    onError: (error) => {
      toast.error(TEXT.projects.create.error.replace("{error}", error.message));
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: { id: string; data: ProjectFormData }) => {
      return pb.collection("projects").update(data.id, data.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsEditOpen(false);
      setSelectedProject(null);
      setFormData({ name: "", code: "" });
      toast.success(TEXT.projects.edit.success);
    },
    onError: (error) => {
      toast.error(TEXT.projects.edit.error.replace("{error}", error.message));
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => {
      return pb.collection("projects").delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(TEXT.projects.delete.success);
    },
    onError: (error) => {
      toast.error(TEXT.projects.delete.error.replace("{error}", error.message));
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProject) {
      updateProjectMutation.mutate({
        id: selectedProject.id,
        data: formData,
      });
    }
  };

  const handleEdit = (project: ProjectsResponse) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      code: project.code,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (project: ProjectsResponse) => {
    if (window.confirm(TEXT.projects.delete.confirm)) {
      deleteProjectMutation.mutate(project.id);
    }
  };

  const isSupervisor =
    user?.role === UsersRoleOptions.supervisor ||
    user?.role === UsersRoleOptions.admin;

  return (
    <>
      <div className="mt-4 flex flex-col space-y-4 bg-white px-4 pb-8 text-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{TEXT.projects.title}</h1>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-600">
              {TEXT.projects.list.count.replace(
                "{count}",
                (userProjects?.length ?? 0).toString(),
              )}
            </span>
          </div>
          {isSupervisor && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 size-4" />
              {TEXT.projects.create.button}
            </Button>
          )}
        </div>
        {isLoadingProjects ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-4 animate-spin" />
          </div>
        ) : (
          <ProjectListGroup
            projects={userProjects ?? []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isSupervisor={isSupervisor}
          />
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{TEXT.projects.create.title}</DialogTitle>
            <DialogDescription>
              {TEXT.projects.create.description}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name">{TEXT.projects.create.form.name}</label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="code">{TEXT.projects.create.form.code}</label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createProjectMutation.isPending}>
                {createProjectMutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                {TEXT.projects.create.submit}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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
    </>
  );
}
