import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconCalendar,
  IconChevronDown,
  IconFilter,
  IconX,
} from "@tabler/icons-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DatePicker from "@/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { common, reports, tasks } from "@/constants";
import type {
  ProjectsRecord,
  TasksPriorityOptions,
  TasksStatusOptions,
  UsersRecord,
} from "@/lib/pocketbase-types";
import { TASK_STATUS_CONFIG } from "@/lib/status-utils";
import { formatUserName } from "@/lib/utils";

export type TimeRange = {
  preset: "TODAY" | "7D" | "30D" | "QTD" | "YTD" | "CUSTOM";
  start?: Date;
  end?: Date;
};

export type Filters = {
  projectIds: string[];
  assigneeIds: string[];
  statuses: TasksStatusOptions[];
  priorities: TasksPriorityOptions[];
};

type Props = {
  value: { timeRange: TimeRange; filters: Filters };
  onChange: (value: { timeRange: TimeRange; filters: Filters }) => void;
  projects: ProjectsRecord[];
  users: UsersRecord[];
};

const TIME_PRESETS = {
  TODAY: { label: reports.timePresets.today, value: "TODAY" as const },
  "7D": { label: reports.timePresets.last7Days, value: "7D" as const },
  "30D": { label: reports.timePresets.last30Days, value: "30D" as const },
  QTD: { label: reports.timePresets.currentQuarter, value: "QTD" as const },
  YTD: { label: reports.timePresets.currentYear, value: "YTD" as const },
  CUSTOM: { label: reports.timePresets.custom, value: "CUSTOM" as const },
} as const;

const STATUS_OPTIONS: { label: string; value: TasksStatusOptions }[] =
  Object.values(TASK_STATUS_CONFIG).map((config) => ({
    label: config.name,
    value: config.key,
  }));

const PRIORITY_OPTIONS: { label: string; value: TasksPriorityOptions }[] = [
  { label: tasks.priority.urgent, value: "urgent" as TasksPriorityOptions },
  { label: reports.high, value: "high" as TasksPriorityOptions },
  { label: reports.medium, value: "medium" as TasksPriorityOptions },
  { label: reports.low, value: "low" as TasksPriorityOptions },
];

export function FiltersBar({ value, onChange, projects, users }: Props) {
  const selectedProjects = useMemo(
    () => projects.filter((p) => value.filters.projectIds.includes(p.id)),
    [projects, value.filters.projectIds],
  );
  const selectedUsers = useMemo(
    () => users.filter((u) => value.filters.assigneeIds.includes(u.id)),
    [users, value.filters.assigneeIds],
  );
  const selectedStatuses = useMemo(
    () =>
      STATUS_OPTIONS.filter((s) => value.filters.statuses.includes(s.value)),
    [value.filters.statuses],
  );
  const selectedPriorities = useMemo(
    () =>
      PRIORITY_OPTIONS.filter((p) =>
        value.filters.priorities.includes(p.value),
      ),
    [value.filters.priorities],
  );

  const hasActiveFilters = useMemo(
    () =>
      value.filters.projectIds.length > 0 ||
      value.filters.assigneeIds.length > 0 ||
      value.filters.statuses.length > 0 ||
      value.filters.priorities.length > 0 ||
      value.timeRange.preset !== "30D",
    [value.filters, value.timeRange.preset],
  );

  const handleTimeRangeChange = (preset: TimeRange["preset"]) => {
    onChange({ ...value, timeRange: { preset } });
  };

  const handleToggle = (
    key: keyof Filters,
    id: string | TasksStatusOptions | TasksPriorityOptions,
    checked: boolean,
  ) => {
    const current = value.filters[key] as string[];
    const next = checked ? [...current, id] : current.filter((x) => x !== id);
    onChange({ ...value, filters: { ...value.filters, [key]: next } });
  };

  const clearAllFilters = () => {
    onChange({
      timeRange: { preset: "30D" },
      filters: {
        projectIds: [],
        assigneeIds: [],
        statuses: [],
        priorities: [],
      },
    });
  };

  return (
    <div className="bg-border/40 flex flex-wrap items-center gap-px overflow-hidden rounded-xl">
      {/* Time Segment */}
      <div className="bg-card border-border/10 flex h-16 min-w-40 flex-col justify-between border-s p-3">
        <div className="mb-1 flex items-center justify-end gap-1.5 opacity-40">
          <span className="text-[7px] font-bold tracking-tight">
            {reports.filters.timeframe}
          </span>
          <IconCalendar className="size-2.5" />
        </div>
        <Select
          value={value.timeRange.preset}
          onValueChange={handleTimeRangeChange}
        >
          <SelectTrigger className="bg-muted/10 h-7 rounded-lg border-none px-2 text-right text-[11px] font-bold tracking-tight focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border bg-card rounded-xl border">
            {Object.values(TIME_PRESETS).map((preset) => (
              <SelectItem
                key={preset.value}
                value={preset.value}
                className="text-[10px] font-bold"
              >
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Projects Segment */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="bg-card border-border/10 hover:bg-muted/30 flex h-16 min-w-35 flex-col justify-between border-s p-3 text-right transition-colors"
          >
            <div className="mb-1 flex items-center justify-end gap-1.5 opacity-40">
              <span className="text-[7px] font-bold tracking-tight">
                {reports.projects}
              </span>
              <IconFilter className="size-2.5" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <IconChevronDown className="size-3 opacity-20" />
              <span className="text-[11px] font-bold tracking-tight">
                {selectedProjects.length > 0
                  ? reports.filters.selectedCount.replace(
                      "{count}",
                      digitsEnToFa(selectedProjects.length),
                    )
                  : reports.filters.allProjects}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-border bg-card w-64 rounded-xl border p-0"
          align="start"
        >
          <div className="p-4">
            <h4 className="border-border/40 mb-3 border-b pb-2 text-[10px] font-bold tracking-tight">
              {reports.selectProjects}
            </h4>
            <div className="max-h-48 space-y-2 overflow-y-auto pe-1">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-end space-x-2 space-x-reverse"
                >
                  <label
                    htmlFor={`p-${project.id}`}
                    className="flex-1 cursor-pointer text-right text-[11px] font-bold"
                  >
                    {project.name}
                  </label>
                  <Checkbox
                    id={`p-${project.id}`}
                    checked={value.filters.projectIds.includes(project.id)}
                    onCheckedChange={(c) =>
                      handleToggle("projectIds", project.id, !!c)
                    }
                    className="rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Assignees Segment */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="bg-card border-border/10 hover:bg-muted/30 flex h-16 min-w-35 flex-col justify-between border-s p-3 text-right transition-colors"
          >
            <div className="mb-1 flex items-center justify-end gap-1.5 opacity-40">
              <span className="text-[7px] font-bold tracking-tight">
                {reports.assignee_plural}
              </span>
              <IconFilter className="size-2.5" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <IconChevronDown className="size-3 opacity-20" />
              <span className="text-[11px] font-bold tracking-tight">
                {selectedUsers.length > 0
                  ? reports.filters.selectedCount.replace(
                      "{count}",
                      digitsEnToFa(selectedUsers.length),
                    )
                  : reports.filters.allAssignees}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-border bg-card w-64 rounded-xl border p-0"
          align="start"
        >
          <div className="p-4">
            <h4 className="border-border/40 mb-3 border-b pb-2 text-[10px] font-bold tracking-tight">
              {reports.selectAssignees}
            </h4>
            <div className="max-h-48 space-y-2 overflow-y-auto pe-1">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-end space-x-2 space-x-reverse"
                >
                  <label
                    htmlFor={`u-${u.id}`}
                    className="flex-1 cursor-pointer text-right text-[11px] font-bold"
                  >
                    {formatUserName(u.first_name, u.last_name, u.username)}
                  </label>
                  <Checkbox
                    id={`u-${u.id}`}
                    checked={value.filters.assigneeIds.includes(u.id)}
                    onCheckedChange={(c) =>
                      handleToggle("assigneeIds", u.id, !!c)
                    }
                    className="rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Status Segment */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="bg-card border-border/10 hover:bg-muted/30 flex h-16 min-w-35 flex-col justify-between border-s p-3 text-right transition-colors"
          >
            <div className="mb-1 flex items-center justify-end gap-1.5 opacity-40">
              <span className="text-[7px] font-bold tracking-tight">
                {reports.status}
              </span>
              <IconFilter className="size-2.5" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <IconChevronDown className="size-3 opacity-20" />
              <span className="text-[11px] font-bold tracking-tight">
                {selectedStatuses.length > 0
                  ? reports.filters.selectedCount.replace(
                      "{count}",
                      digitsEnToFa(selectedStatuses.length),
                    )
                  : reports.filters.allStatuses}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-border bg-card w-64 rounded-xl border p-0"
          align="start"
        >
          <div className="p-4">
            <h4 className="border-border/40 mb-3 border-b pb-2 text-[10px] font-bold tracking-tight">
              {reports.selectStatuses}
            </h4>
            <div className="space-y-2 overflow-y-auto pe-1">
              {STATUS_OPTIONS.map((s) => (
                <div
                  key={s.value}
                  className="flex items-center justify-end space-x-2 space-x-reverse"
                >
                  <label
                    htmlFor={`s-${s.value}`}
                    className="flex-1 cursor-pointer text-right text-[11px] font-bold"
                  >
                    {s.label}
                  </label>
                  <Checkbox
                    id={`s-${s.value}`}
                    checked={value.filters.statuses.includes(s.value)}
                    onCheckedChange={(c) =>
                      handleToggle("statuses", s.value, !!c)
                    }
                    className="rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Priority Segment */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="bg-card border-border/10 hover:bg-muted/30 flex h-16 min-w-35 flex-col justify-between border-s p-3 text-right transition-colors"
          >
            <div className="mb-1 flex items-center justify-end gap-1.5 opacity-40">
              <span className="text-[7px] font-bold tracking-tight">
                {reports.priority}
              </span>
              <IconFilter className="size-2.5" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <IconChevronDown className="size-3 opacity-20" />
              <span className="text-[11px] font-bold tracking-tight">
                {selectedPriorities.length > 0
                  ? reports.filters.selectedCount.replace(
                      "{count}",
                      digitsEnToFa(selectedPriorities.length),
                    )
                  : reports.filters.allPriorities}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-border bg-card w-64 rounded-xl border p-0"
          align="start"
        >
          <div className="p-4">
            <h4 className="border-border/40 mb-3 border-b pb-2 text-[10px] font-bold tracking-tight">
              {reports.selectPriorities}
            </h4>
            <div className="space-y-2 overflow-y-auto pe-1">
              {PRIORITY_OPTIONS.map((p) => (
                <div
                  key={p.value}
                  className="flex items-center justify-end space-x-2 space-x-reverse"
                >
                  <label
                    htmlFor={`pe-${p.value}`}
                    className="flex-1 cursor-pointer text-right text-[11px] font-bold"
                  >
                    {p.label}
                  </label>
                  <Checkbox
                    id={`pe-${p.value}`}
                    checked={value.filters.priorities.includes(p.value)}
                    onCheckedChange={(c) =>
                      handleToggle("priorities", p.value, !!c)
                    }
                    className="rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Reset Segment */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={clearAllFilters}
          className="bg-muted/20 border-border/10 flex h-16 flex-col items-center justify-center border-s px-6 text-rose-500 transition-colors hover:bg-rose-500/10"
        >
          <div className="mb-1 flex items-center justify-end gap-1.5 opacity-40">
            <span className="text-[7px] font-bold tracking-tight">
              {reports.filters.reset}
            </span>
            <IconX className="size-2.5" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">
            {digitsEnToFa("00")}
          </span>
        </Button>
      )}

      {/* Custom Date Range Picker */}
      {value.timeRange.preset === "CUSTOM" && (
        <div className="bg-muted/10 border-border/10 flex h-16 items-center gap-2 border-s px-4">
          <DatePicker
            date={value.timeRange.start}
            setDate={(d) =>
              onChange({
                ...value,
                timeRange: { ...value.timeRange, start: d },
              })
            }
          />
          <span className="text-[10px] font-bold opacity-30">
            {common.connectors.to}
          </span>
          <DatePicker
            date={value.timeRange.end}
            setDate={(d) =>
              onChange({ ...value, timeRange: { ...value.timeRange, end: d } })
            }
          />
        </div>
      )}
    </div>
  );
}
