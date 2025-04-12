import { TEXT } from "@/constants/text";
import { ProjectsResponse } from "@/lib/pocketbase-types";
import { ProjectListHeader } from "./project-list-header";
import { ProjectListItem } from "./project-list-item";

interface ProjectListGroupProps {
  projects: ProjectsResponse[];
  onEdit?: (project: ProjectsResponse) => void;
  onDelete?: (project: ProjectsResponse) => void;
  isSupervisor?: boolean;
}

export function ProjectListGroup({
  projects,
  onEdit,
  onDelete,
  isSupervisor,
}: ProjectListGroupProps) {
  return (
    <section className="bg-white">
      <ProjectListHeader />
      <div className="divide-y divide-white">
        {projects?.length > 0 ? (
          projects?.map((project, index) => (
            <ProjectListItem
              key={project.id}
              project={project}
              onEdit={onEdit}
              onDelete={onDelete}
              isSupervisor={isSupervisor}
              className={index % 2 === 0 ? "bg-gray-100" : ""}
            />
          ))
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">
            {TEXT.projects.list.noProjects}
          </div>
        )}
      </div>
    </section>
  );
}
