import { BarChart3 } from "lucide-react";

import {
  FiltersBar,
  type Filters,
  type TimeRange,
} from "@/components/reports/filters-bar";
import { ProjectExportButton } from "@/components/reports/project-export-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reports } from "@/constants";
import type { ProjectWithSupervisor, TaskWithProject } from "@/lib/pocketbase";
import type { ProjectsResponse, UsersResponse } from "@/lib/pocketbase-types";

export type FiltersSectionState = {
  timeRange: TimeRange;
  filters: Filters;
};

type FiltersSectionProps = {
  value: FiltersSectionState;
  onChange: (next: FiltersSectionState) => void;
  rangeLabel: string;
  projects: ProjectsResponse[];
  users: UsersResponse[];
  projectsWithSupervisor?: ProjectWithSupervisor[];
  tasks: TaskWithProject[];
};

export function FiltersSection({
  value,
  onChange,
  rangeLabel,
  projects,
  users,
  projectsWithSupervisor,
  tasks,
}: FiltersSectionProps) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <BarChart3 className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
            {reports.dashboardTitle}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {reports.range.label} {rangeLabel}
          </p>
        </div>
      </div>

      <div
        className="mb-8"
        aria-label={reports.aria.filters}
        data-animate-stagger
      >
        <FiltersBar
          value={value}
          onChange={onChange}
          projects={projects}
          users={users}
        />
      </div>

      {projects.length > 0 && (
        <Card className="mb-6" data-animate-stagger>
          <CardHeader>
            <CardTitle>{reports.projectsExportSection}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const projectWithSupervisor = projectsWithSupervisor?.find(
                  (p) => p.id === project.id,
                ) || {
                  ...project,
                  expand: { supervisor: undefined },
                };
                const projectTasks = tasks.filter(
                  (task) => task.project === project.id,
                );
                const taskCount = projectTasks.length;

                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{project.name}</h3>
                      {project.code && (
                        <p className="text-muted-foreground text-sm">
                          {project.code}
                        </p>
                      )}
                      <p className="text-muted-foreground mt-1 text-xs">
                        {taskCount > 0
                          ? reports.taskCount.replace(
                              "{count}",
                              String(taskCount),
                            )
                          : reports.noTasksInProject}
                      </p>
                    </div>
                    <div className="ml-4 shrink-0">
                      <ProjectExportButton
                        project={projectWithSupervisor}
                        tasks={tasks}
                        users={users}
                        taskCount={taskCount}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
