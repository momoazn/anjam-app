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
      <div className="border-border/10 bg-card relative mb-12 flex flex-col gap-8 rounded-3xl border p-8 shadow-sm md:flex-row md:items-center md:justify-between lg:p-12">
        <BlueprintPattern variant="dots" className="opacity-[0.02]" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-primary text-primary-foreground shadow-primary/20 flex size-16 items-center justify-center rounded-2xl shadow-lg">
              <Target className="size-8" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 opacity-40">
                <span className="text-[10px] font-bold tracking-tight">
                  Project Registry
                </span>
                <div className="bg-foreground/20 h-px w-8" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                {projects.title}
              </h1>
            </div>
          </div>

          <p className="text-muted-foreground/60 max-w-md text-sm leading-relaxed font-medium">
            {projects.list.count.replace(
              "{count}",
              digitsEnToFa(userProjects?.length ?? 0).toString(),
            )}
          </p>
        </div>

        {canCreateProject && (
          <div className="relative z-10">
            <Button
              className="hover:shadow-primary/10 h-14 gap-3 rounded-2xl px-8 text-lg font-bold shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
              size="lg"
              onClick={() => navigate("/projects/new")}
            >
              <Plus className="size-6" />
              <span>{projects.create.button}</span>
            </Button>
          </div>
        )}
      </div>

      {isLoadingProjects ? (
        <div className="flex h-full items-center justify-center py-24">
          <div className="relative flex flex-col items-center">
            <Loader2 className="text-primary size-12 animate-spin opacity-20" />
            <span className="text-muted-foreground/50 mt-4 text-[10px] font-bold tracking-tight">
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
