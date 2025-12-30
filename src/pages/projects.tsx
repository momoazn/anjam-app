import { Loader2, Plus, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ProjectListGroup } from "@/components/project/project-list-group";
import { PageTransition } from "@/components/page-transition";
import { HeroHeader } from "@/components/recipes/hero-header";
import { Button } from "@/components/ui/button";
import { projects } from "@/constants";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useProjects } from "@/hooks";
import { useAuthUser, useCurrentOrgRole } from "@/store/auth-store";
import { digitsEnToFa } from "@persian-tools/persian-tools";

export default function Projects() {
  const user = useAuthUser();
  const currentOrgRole = useCurrentOrgRole();
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
  const isOrgOwner = currentOrgRole === "owner";
  const isOrgAdmin = currentOrgRole === "admin";
  const canCreateProject = isAdmin || isSupervisor || isOrgOwner || isOrgAdmin;
  const canEditDelete = isAdmin || isSupervisor || isOrgOwner || isOrgAdmin;

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      <HeroHeader
        icon={Target}
        iconTone="primarySolid"
        eyebrow={
          <div className="flex items-center gap-2 opacity-40">
            <span className="text-[10px] font-bold tracking-tight">
              {projects.title}
            </span>
            <div className="bg-foreground/20 h-px w-8" />
          </div>
        }
        title={projects.title}
        subtitle={projects.list.count.replace(
          "{count}",
          digitsEnToFa(userProjects?.length ?? 0).toString(),
        )}
        action={
          canCreateProject ? (
            <Button
              className="hover:shadow-primary/10 h-14 gap-3 rounded-2xl px-8 text-lg font-bold shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
              size="lg"
              onClick={() => navigate("/projects/new")}
            >
              <Plus className="size-6" />
              <span>{projects.create.button}</span>
            </Button>
          ) : null
        }
      />

      {isLoadingProjects ? (
        <div className="flex h-full items-center justify-center py-24">
          <div className="relative flex flex-col items-center">
            <Loader2 className="text-primary size-12 animate-spin opacity-20" />
            <span className="text-muted-foreground/50 mt-4 text-[10px] font-bold tracking-tight">
              {projects.files.uploading}
            </span>
          </div>
        </div>
      ) : (
        <ProjectListGroup
          projects={userProjects ?? []}
          onEdit={handleEdit}
          canEditDelete={canEditDelete}
        />
      )}
    </PageTransition>
  );
}
