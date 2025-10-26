import { CalendarIcon, Filter, X } from "lucide-react";
import { useMemo } from "react";
import { digitsEnToFa } from "@persian-tools/persian-tools";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import type { ProjectsRecord, UsersRecord } from "@/lib/pocketbase-types";

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
  TODAY: { label: "امروز", value: "TODAY" as const },
  "7D": { label: "۷ روز گذشته", value: "7D" as const },
  "30D": { label: "۳۰ روز گذشته", value: "30D" as const },
  QTD: { label: "ربع جاری", value: "QTD" as const },
  YTD: { label: "سال جاری", value: "YTD" as const },
} as const;

const STATUS_OPTIONS: { label: string; value: TasksStatusOptions }[] = [
  { label: "در انتظار", value: "todo" },
  { label: "در حال انجام", value: "in_progress" },
  { label: "تکمیل شده", value: "done" },
  { label: "لغو شده", value: "canceled" },
];

const PRIORITY_OPTIONS: { label: string; value: TasksPriorityOptions }[] = [
  { label: "فوری", value: "urgent" },
  { label: "اولویت بالا", value: "high" },
  { label: "اولویت متوسط", value: "medium" },
  { label: "اولویت پایین", value: "low" },
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
    onChange({
      ...value,
      timeRange: { preset },
    });
  };

  const handleProjectToggle = (projectId: string, checked: boolean) => {
    const newProjectIds = checked
      ? [...value.filters.projectIds, projectId]
      : value.filters.projectIds.filter((id) => id !== projectId);

    onChange({
      ...value,
      filters: { ...value.filters, projectIds: newProjectIds },
    });
  };

  const handleUserToggle = (userId: string, checked: boolean) => {
    const newAssigneeIds = checked
      ? [...value.filters.assigneeIds, userId]
      : value.filters.assigneeIds.filter((id) => id !== userId);

    onChange({
      ...value,
      filters: { ...value.filters, assigneeIds: newAssigneeIds },
    });
  };

  const handleStatusToggle = (status: TasksStatusOptions, checked: boolean) => {
    const newStatuses = checked
      ? [...value.filters.statuses, status]
      : value.filters.statuses.filter((s) => s !== status);

    onChange({
      ...value,
      filters: { ...value.filters, statuses: newStatuses },
    });
  };

  const handlePriorityToggle = (
    priority: TasksPriorityOptions,
    checked: boolean,
  ) => {
    const newPriorities = checked
      ? [...value.filters.priorities, priority]
      : value.filters.priorities.filter((p) => p !== priority);

    onChange({
      ...value,
      filters: { ...value.filters, priorities: newPriorities },
    });
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

  const formatUserName = (user: UsersRecord) => {
    return user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.username;
  };

  return (
    <div className="bg-card flex flex-wrap items-center gap-3 rounded-lg border p-4">
      {/* Time Range Preset */}
      <div className="flex items-center gap-2">
        <CalendarIcon className="text-muted-foreground h-4 w-4" />
        <Select
          value={value.timeRange.preset}
          onValueChange={handleTimeRangeChange}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(TIME_PRESETS).map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Projects Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="justify-start">
            <Filter className="mr-2 h-4 w-4" />
            پروژه‌ها
            {selectedProjects.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {digitsEnToFa(selectedProjects.length)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="p-4">
            <h4 className="font-medium">انتخاب پروژه‌ها</h4>
            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`project-${project.id}`}
                    checked={value.filters.projectIds.includes(project.id)}
                    onCheckedChange={(checked) =>
                      handleProjectToggle(project.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`project-${project.id}`}
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {project.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Assignees Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="justify-start">
            <Filter className="mr-2 h-4 w-4" />
            مجریان
            {selectedUsers.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {digitsEnToFa(selectedUsers.length)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="p-4">
            <h4 className="font-medium">انتخاب مجریان</h4>
            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={value.filters.assigneeIds.includes(user.id)}
                    onCheckedChange={(checked) =>
                      handleUserToggle(user.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`user-${user.id}`}
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {formatUserName(user)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Status Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="justify-start">
            <Filter className="mr-2 h-4 w-4" />
            وضعیت
            {selectedStatuses.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {digitsEnToFa(selectedStatuses.length)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="p-4">
            <h4 className="font-medium">انتخاب وضعیت‌ها</h4>
            <div className="mt-3 space-y-2">
              {STATUS_OPTIONS.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={value.filters.statuses.includes(status.value)}
                    onCheckedChange={(checked) =>
                      handleStatusToggle(status.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`status-${status.value}`}
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {status.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Priority Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="justify-start">
            <Filter className="mr-2 h-4 w-4" />
            اولویت
            {selectedPriorities.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {digitsEnToFa(selectedPriorities.length)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="p-4">
            <h4 className="font-medium">انتخاب اولویت‌ها</h4>
            <div className="mt-3 space-y-2">
              {PRIORITY_OPTIONS.map((priority) => (
                <div
                  key={priority.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`priority-${priority.value}`}
                    checked={value.filters.priorities.includes(priority.value)}
                    onCheckedChange={(checked) =>
                      handlePriorityToggle(priority.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`priority-${priority.value}`}
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {priority.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="mr-2 h-4 w-4" />
            پاک کردن فیلترها
          </Button>
        </>
      )}
    </div>
  );
}
