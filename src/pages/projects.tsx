import { Loader2, Plus, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ProjectListGroup } from "@/components/project/project-list-group";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { projects } from "@/constants";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useProjects } from "@/hooks";
import { useAuthUser } from "@/store/auth-store";
import { digitsEnToFa } from "@persian-tools/persian-tools";

export default function Projects() {
  const user = useAuthUser();
  const navigate = useNavigate();

  const { data: userProjects, isPending: isLoadingProjects } = useProjects({
    batch: 100,
    sort: "-created",
  });

  const handleEdit = (projectId: string) => {
    navigate(`/projects/${projectId}/edit`);
  };

  const isAdmin = user?.role === UsersRoleOptions.admin;
  const isSupervisor = user?.role === UsersRoleOptions.supervisor;
  const canCreateProject = isAdmin || isSupervisor;

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <Target className="h-5 w-5 md:h-6 md:w-6" />
            {projects.title}
          </h1>
          <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
            {projects.list.count.replace(
              "{count}",
              digitsEnToFa(userProjects?.length ?? 0).toString(),
            )}
          </span>
        </div>
        {canCreateProject && (
          <Button
            onClick={() => navigate("/projects/new")}
            className="w-full gap-2 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {projects.create.button}
          </Button>
        )}
      </div>
      {isLoadingProjects ? (
        <div className="flex h-full items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : (
        <ProjectListGroup
          projects={userProjects ?? []}
          onEdit={handleEdit}
          canEditDelete={isAdmin || isSupervisor}
        />
      )}
    </PageTransition>
  );
}
