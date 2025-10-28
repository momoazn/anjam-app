import { Loader2, Plus, Target } from "lucide-react";
import { useState } from "react";

import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { EditProjectDialog } from "@/components/project/edit-project-dialog";
import { ProjectListGroup } from "@/components/project/project-list-group";
import { Button } from "@/components/ui/button";
import { fa } from "@/constants/text";
import { ProjectsResponse, UsersRoleOptions } from "@/lib/pocketbase-types";
import { useProjects } from "@/hooks";
import { useAuthUser } from "@/store/auth-store";
import { digitsEnToFa } from "@persian-tools/persian-tools";

export default function Projects() {
  const user = useAuthUser();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectsResponse | null>(null);

  const { data: userProjects, isPending: isLoadingProjects } = useProjects({
    batch: 100,
    sort: "-created",
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
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
              <Target className="h-5 w-5 md:h-6 md:w-6" />
              {fa.projects.title}
            </h1>
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
              {fa.projects.list.count.replace(
                "{count}",
                digitsEnToFa(userProjects?.length ?? 0).toString(),
              )}
            </span>
          </div>
          {canCreateProject && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="w-full gap-2 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              {fa.projects.create.button}
            </Button>
          )}
        </div>
        {isLoadingProjects ? (
          <div className="flex h-full items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
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
