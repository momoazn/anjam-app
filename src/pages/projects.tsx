import { Loader2, Plus, Target, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ProjectListGroup } from "@/components/project/project-list-group";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { projects, app } from "@/constants";
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
      <div className="bg-card relative mb-8 overflow-hidden rounded-3xl border p-8 shadow-xl">
        {/* Blueprint Grid Background */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5">
            <div className="bg-primary/10 text-primary ring-primary/20 flex size-14 items-center justify-center rounded-2xl ring-1">
              <Target className="size-7" />
            </div>
            <div>
              <div className="text-primary flex items-center gap-2">
                <Layers className="size-3" />
                <span className="text-muted-foreground/60 text-[10px] font-black tracking-[0.2em] uppercase">
                  {app.name} / Central Registry
                </span>
              </div>
              <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
                {projects.title}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed font-medium">
                {projects.list.count.replace(
                  "{count}",
                  digitsEnToFa(userProjects?.length ?? 0).toString(),
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {canCreateProject && (
              <Button
                onClick={() => navigate("/projects/new")}
                className="shadow-primary/20 h-12 gap-3 rounded-xl px-6 font-black shadow-lg transition-all hover:scale-105 active:scale-95"
                size="lg"
              >
                <Plus className="size-5" />
                {projects.create.button}
              </Button>
            )}
          </div>
        </div>

        {/* Structural Accent */}
        <div className="bg-primary/20 absolute right-0 bottom-0 h-1 w-32" />
        <div className="bg-primary/20 absolute right-0 bottom-0 h-8 w-1" />
      </div>

      {isLoadingProjects ? (
        <div className="flex h-full items-center justify-center py-24">
          <div className="relative flex flex-col items-center">
            <Loader2 className="text-primary size-12 animate-spin opacity-20" />
            <span className="text-muted-foreground/50 mt-4 text-[10px] font-black tracking-widest uppercase">
              Loading Data Grid
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
