import { Loader2, Plus, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ProjectListGroup } from "@/components/project/project-list-group";
import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
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

  const headerActions = canCreateProject ? (
    <Button
      onClick={() => navigate("/projects/new")}
      className="h-14 gap-3 rounded-none px-8 font-black shadow-md transition-all hover:shadow-lg active:scale-95"
      size="lg"
    >
      <Plus className="size-5" />
      <span className="tracking-tight uppercase">{projects.create.button}</span>
    </Button>
  ) : null;

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      <PageHeader
        title={projects.title}
        description={projects.list.count.replace(
          "{count}",
          digitsEnToFa(userProjects?.length ?? 0).toString(),
        )}
        icon={Target}
        actions={headerActions}
      />

      {isLoadingProjects ? (
        <div className="flex h-full items-center justify-center py-24">
          <div className="relative flex flex-col items-center">
            <Loader2 className="text-primary size-12 animate-spin opacity-20" />
            <span className="text-muted-foreground/50 mt-4 text-[10px] font-black tracking-tight uppercase">
              Loading Projects...
            </span>
          </div>
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
