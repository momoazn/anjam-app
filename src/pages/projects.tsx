import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { EditProjectDialog } from "@/components/project/edit-project-dialog";
import { ProjectListGroup } from "@/components/project/project-list-group";
import { Button } from "@/components/ui/button";
import { TEXT } from "@/constants/text";
import { pb } from "@/lib/pocketbase";
import { ProjectsResponse, UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";
import { digitsEnToFa } from "@persian-tools/persian-tools";

export default function Projects() {
  const user = useAuthUser();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectsResponse | null>(null);

  const { data: userProjects, isPending: isLoadingProjects } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: () => {
      return pb.collection("projects").getFullList<ProjectsResponse>({
        batch: 100,
        sort: "-created",
      });
    },
  });

  const handleEdit = (project: ProjectsResponse) => {
    setSelectedProject(project);
    setIsEditOpen(true);
  };

  const isAdmin = user?.role === UsersRoleOptions.admin;
  const isSupervisor = user?.role === UsersRoleOptions.supervisor;
  const canCreateProject = isAdmin || isSupervisor;

  return (
    <>
      <div className="text-foreground mt-4 flex flex-col space-y-4 px-4 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{TEXT.projects.title}</h1>
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-sm">
              {TEXT.projects.list.count.replace(
                "{count}",
                digitsEnToFa(userProjects?.length ?? 0).toString(),
              )}
            </span>
          </div>
          {canCreateProject && (
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
            canEditDelete={isAdmin || isSupervisor}
          />
        )}
      </div>

      <CreateProjectDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <EditProjectDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        project={selectedProject}
      />
    </>
  );
}
