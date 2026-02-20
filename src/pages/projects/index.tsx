import { digitsEnToFa } from "@persian-tools/persian-tools";
import { Plus, Target } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { ProjectListGroup } from "@/components/project/project-list-group";
import { ProjectCardSkeleton } from "@/components/skeletons/project-card-skeleton";
import { Button } from "@/components/ui/button";
import { projects } from "@/constants";
import { useProjects } from "@/hooks/projects";
import { useCurrentOrgRole } from "@/store/app-context-store";
import { useOpenModal } from "@/store/modal-store";

export default function Projects() {
  const currentOrgRole = useCurrentOrgRole();
  const openModal = useOpenModal();

  const { data: userProjects, isPending: isLoadingProjects } = useProjects();

  const handleEdit = (projectId: string) => {
    openModal("edit-project", { projectId });
  };

  const isOrgOwner = currentOrgRole === "owner";
  const isOrgAdmin = currentOrgRole === "owner";
  const canCreateProject = isOrgOwner || isOrgAdmin;
  const canEditDelete = isOrgOwner || isOrgAdmin;

  return (
    <PageTransition
      data-testid="projects-page"
      className="container mx-auto max-w-7xl p-4 md:p-6"
    >
      <PageHeader
        icon={Target}
        title={projects.title}
        subtitle={projects.list.count.replace(
          "{count}",
          digitsEnToFa(userProjects?.length ?? 0).toString(),
        )}
        actions={
          canCreateProject ? (
            <Button
              data-testid="new-project-button"
              className="h-8 gap-2 rounded-lg px-3 text-xs font-semibold"
              onClick={() => openModal("create-project")}
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
