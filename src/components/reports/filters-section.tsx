import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconStack2, IconTerminal } from "@tabler/icons-react";

import {
  type Filters,
  FiltersBar,
  type TimeRange,
} from "@/components/reports/filters-bar";
import { ProjectExportButton } from "@/components/reports/project-export-button";
import { reports } from "@/constants";
import type { ConvexTask, ConvexUser } from "@/lib/reports/types";

// Convex project type (minimal)
type ConvexProject = {
  _id: string;
  id: string; // Compatibility alias
  name: string;
  code: string;
};

export type FiltersSectionState = {
  timeRange: TimeRange;
  filters: Filters;
};

type FiltersSectionProps = {
  value: FiltersSectionState;
  onChange: (next: FiltersSectionState) => void;
  rangeLabel: string;
  projects: ConvexProject[];
  users: ConvexUser[];
  tasks: ConvexTask[];
};

export function FiltersSection({
  value,
  onChange,
  projects,
  users,
  tasks,
}: FiltersSectionProps) {
  return (
    <div className="space-y-10">
      <div
        className="bg-muted/5 border-border/40 rounded-xl border p-6"
        data-animate-stagger
      >
        <div className="mb-6 flex items-center justify-end gap-2 text-right opacity-40">
          <span className="text-[10px] font-bold tracking-tight">
            {reports.filters.title}
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
              <h2 className="text-sm font-bold tracking-tight">
                {reports.projectsExportSection}
              </h2>
              <IconStack2 className="text-primary/60 size-4" />
            </div>
          </div>

          <div className="bg-border/40 border-border/40 grid grid-cols-1 gap-px overflow-hidden rounded-xl border md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              // Get project with _creationTime for export
              const exportProject = {
                _id: project._id || project.id,
                id: project.id || project._id,
                name: project.name,
                code: project.code,
                description: undefined,
                _creationTime: 0,
              };
              const projectTasks = tasks.filter(
                (task) =>
                  task.projectId === project._id ||
                  task.projectId === project.id ||
                  task.project === project._id ||
                  task.project === project.id,
              );
              const taskCount = projectTasks.length;

              return (
                <div
                  key={project.id}
                  className="group bg-card hover:bg-muted/10 relative flex flex-col justify-between overflow-hidden p-6 transition-all"
                >
                  <div className="min-w-0 flex-1 text-right">
                    <div className="mb-1 flex items-center justify-end gap-2 opacity-40">
                      <span className="font-mono text-[9px] font-bold tracking-tight">
                        {project.code}
                      </span>
                    </div>
                    <h3 className="group-hover:text-primary mb-4 truncate text-base font-bold tracking-tight transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center justify-end gap-2 text-right">
                      <span className="text-muted-foreground/60 text-[10px] font-bold">
                        {reports.filters.entry}
                      </span>
                      <div className="bg-border/40 h-px w-4" />
                      <span className="text-xs font-bold tabular-nums">
                        {taskCount > 0 ? digitsEnToFa(taskCount) : "0"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <ProjectExportButton
                      project={exportProject}
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
