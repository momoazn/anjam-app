import { digitsEnToFa } from "@persian-tools/persian-tools";
import { Plus, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { ProjectListGroup } from "@/components/project/project-list-group";
import { ProjectCardSkeleton } from "@/components/skeletons/project-card-skeleton";
import { Button } from "@/components/ui/button";
import { projects } from "@/constants";
import { useProjects } from "@/hooks";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import {
  useAuthUser,
  useCurrentOrgMode,
  useCurrentOrgRole,
} from "@/store/auth-store";

export default function Projects() {
  const user = useAuthUser();
  const currentOrgRole = useCurrentOrgRole();
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
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
    <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
      <PageHeader
        icon={Target}
        eyebrow={isProductMode ? undefined : projects.title}
        title={projects.title}
        subtitle={projects.list.count.replace(
          "{count}",
          digitsEnToFa(userProjects?.length ?? 0).toString(),
        )}
        actions={
          canCreateProject ? (
            <Button
              className={
                isProductMode
                  ? "h-8 gap-2 rounded-lg px-3 text-xs font-semibold"
                  : "h-10 gap-2 rounded-xl px-5 text-sm font-bold shadow-sm transition-all hover:scale-[1.02]"
              }
              onClick={() => navigate("/projects/new")}
            >
              <Plus className="size-4.5" />
              <span>{projects.create.button}</span>
            </Button>
          ) : null
        }
      />

      {isLoadingProjects ? (
        <ProjectCardSkeleton />
      ) : (
        <ProjectListGroup
          projects={userProjects ?? []}
          onEdit={handleEdit}
          canEditDelete={canEditDelete}
          canCreate={canCreateProject}
        />
      )}
    </PageTransition>
  );
}
