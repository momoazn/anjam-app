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
import { BlueprintPattern } from "@/components/design-system/blueprint-pattern";

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
      <div className="border-foreground relative mb-12 flex flex-col gap-8 border-b-4 pb-12 md:flex-row md:items-end md:justify-between">
        <BlueprintPattern variant="technical" className="opacity-[0.03]" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-foreground text-background flex size-16 items-center justify-center">
              <Target className="size-8" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 opacity-40">
                <span className="font-mono text-[10px] font-black tracking-[0.2em] uppercase">
                  Asset_Registry
                </span>
                <div className="bg-foreground/20 h-px w-8" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter uppercase md:text-7xl">
                {projects.title}
              </h1>
            </div>
          </div>

          <p className="text-muted-foreground/60 max-w-md text-sm leading-relaxed font-bold tracking-tight uppercase">
            {projects.list.count.replace(
              "{count}",
              digitsEnToFa(userProjects?.length ?? 0).toString(),
            )}
          </p>
        </div>

        {canCreateProject && (
          <div className="relative z-10">
            <Button
              className="h-16 gap-4 rounded-none px-10 text-lg font-black shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_rgba(0,0,0,0.15)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none"
              size="lg"
              onClick={() => navigate("/projects/new")}
            >
              <Plus className="size-6" />
              <span className="tracking-tighter uppercase">
                {projects.create.button}
              </span>
            </Button>
          </div>
        )}
      </div>

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
