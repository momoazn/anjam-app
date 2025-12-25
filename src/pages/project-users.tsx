import { IconUsers } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import { digitsEnToFa } from "@persian-tools/persian-tools";

import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { ProjectMembersSection } from "@/components/project/project-members";
import { projects } from "@/constants";
import { useProjectMembers } from "@/hooks/project-members";
import { useProjectWithSupervisor } from "@/hooks";

export default function ProjectUsers() {
  const { id } = useParams<{ id: string }>();
  const projectId = id as string;

  const { data: project } = useProjectWithSupervisor({ id: projectId });
  const { data: projectMembers } = useProjectMembers(projectId);

  return (
    <PageTransition className="container mx-auto max-w-5xl p-4 md:p-6">
      <PageHeader
        title={projects.users.title}
        description={
          projectMembers
            ? `${digitsEnToFa(projectMembers.length)} ${projects.users.count}`
            : projects.users.title
        }
        icon={IconUsers}
        nodeId={`Project_Personnel :: ${project?.code || "???"}`}
      />

      {projectId && <ProjectMembersSection projectId={projectId} />}
    </PageTransition>
  );
}
