import { IconTerminal, IconStack2 } from "@tabler/icons-react";

import {
  FiltersBar,
  type Filters,
  type TimeRange,
} from "@/components/reports/filters-bar";
import { ProjectExportButton } from "@/components/reports/project-export-button";
import { reports } from "@/constants";
import type { ProjectWithSupervisor, TaskWithProject } from "@/lib/pocketbase";
import type { ProjectsResponse, UsersResponse } from "@/lib/pocketbase-types";
import { digitsEnToFa } from "@persian-tools/persian-tools";

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
  projects,
  users,
  projectsWithSupervisor,
  tasks,
}: FiltersSectionProps) {
  return (
    <div className="space-y-10">
      <div
        className="bg-muted/5 border-border/40 border p-6"
        data-animate-stagger
      >
        <div className="mb-6 flex items-center justify-end gap-2 text-right opacity-40">
          <span className="text-[10px] font-black tracking-tight uppercase">
            _Filter_
          </span>
          <IconTerminal className="text-primary size-3.5" />
        </div>
        <FiltersBar
          value={value}
          onChange={onChange}
          projects={projects}
          users={users}
        />
      </div>

      {projects.length > 0 && (
        <div data-animate-stagger>
          <div className="mb-6 flex items-center gap-4">
            <div className="bg-border/20 h-px flex-1" />
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black tracking-tight uppercase">
                {reports.projectsExportSection}
              </h2>
              <IconStack2 className="text-primary/60 size-4" />
            </div>
          </div>

          <div className="bg-border/40 border-border/40 grid grid-cols-1 gap-px border md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const pWithSupervisor = projectsWithSupervisor?.find(
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
                  className="group bg-card hover:bg-muted/10 relative flex flex-col justify-between overflow-hidden p-6 transition-all"
                >
                  <div className="min-w-0 flex-1 text-right">
                    <div className="mb-1 flex items-center justify-end gap-2 opacity-40">
                      <span className="font-mono text-[9px] font-black tracking-tight uppercase">
                        {project.code}
                      </span>
                    </div>
                    <h3 className="group-hover:text-primary mb-4 truncate text-base font-black tracking-tight uppercase transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center justify-end gap-2 text-right">
                      <span className="text-muted-foreground/60 text-[10px] font-bold uppercase">
                        _Entry
                      </span>
                      <div className="bg-border/40 h-px w-4" />
                      <span className="text-xs font-black tabular-nums">
                        {taskCount > 0 ? digitsEnToFa(taskCount) : "0"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <ProjectExportButton
                      project={pWithSupervisor}
                      tasks={tasks}
                      users={users}
                      taskCount={taskCount}
                    />
                  </div>

                  <div className="bg-primary absolute end-0 bottom-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
