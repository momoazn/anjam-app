import { digitsEnToFa } from "@persian-tools/persian-tools";
import { Eraser, Search, SlidersHorizontal, X } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tasks } from "@/constants";
import { useTags } from "@/hooks/tags";
import {
  ALL_FILTER_VALUE,
  type UseTaskFiltersReturn,
} from "@/hooks/use-task-filters";
import type { FilterableTask } from "@/lib/filter-utils";
import { TASK_STATUS_ORDER } from "@/lib/status-utils";
import { cn, formatUserName } from "@/lib/utils";
import { TaskPriority, TaskStatus } from "@/types/tasks";

// User type with compatibility fields
interface UserWithCompat {
  _id: string;
  displayName?: string;
  email?: string;
}

const priorityOrder: TaskPriority[] = ["low", "medium", "high", "urgent"];

type TaskFiltersProps = Omit<
  UseTaskFiltersReturn<FilterableTask>,
  "filteredTasks"
> & {
  users: UserWithCompat[] | undefined;
  isLoadingUsers: boolean;
  /** Extra controls rendered at the end of the search row. */
  actions?: ReactNode;
};

const SELECT_TRIGGER =
  "h-8 w-full gap-2 rounded-lg px-2.5 text-xs font-medium md:w-auto md:min-w-28";

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  allValue: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
};

/** Compact select: the placeholder is the filter name, so no extra label is needed. */
function FilterSelect({
  label,
  value,
  onChange,
  allLabel,
  allValue,
  options,
  disabled,
}: FilterSelectProps) {
  const active = value !== allValue;
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        aria-label={label}
        className={cn(
          SELECT_TRIGGER,
          active && "border-primary/40 bg-primary/5",
        )}
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={allValue} className="text-xs">
          {allLabel}
        </SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const ActiveFilterBadge = ({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) => (
  <Badge
    variant="secondary"
    className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary cursor-pointer gap-1.5 rounded-lg border ps-1 text-[10px] font-bold tracking-tight transition-all"
    onClick={onClear}
  >
    {label}
    <X className="h-3 w-3" />
  </Badge>
);

export function TaskFilters({
  searchTerm,
  selectedStatus,
  selectedPriority,
  selectedAssignee,
  selectedDateRange,
  selectedTag,
  setSearchTerm,
  setSelectedStatus,
  setSelectedPriority,
  setSelectedAssignee,
  setSelectedDateRange,
  setSelectedTag,
  users,
  isLoadingUsers,
  actions,
}: TaskFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const { data: tags, isLoading: isLoadingTags } = useTags();

  const hasActiveFilters = useMemo(
    () =>
      !!(
        searchTerm ||
        selectedStatus !== ALL_FILTER_VALUE ||
        selectedPriority !== ALL_FILTER_VALUE ||
        selectedAssignee !== ALL_FILTER_VALUE ||
        selectedDateRange !== "all" ||
        selectedTag !== "all"
      ),
    [
      searchTerm,
      selectedStatus,
      selectedPriority,
      selectedAssignee,
      selectedDateRange,
      selectedTag,
    ],
  );

  const activeFilterLabels = useMemo(() => {
    const labels: { label: string; onClear: () => void }[] = [];

    if (searchTerm) {
      labels.push({
        label: `${tasks.filters.labels.search}: ${searchTerm}`,
        onClear: () => setSearchTerm(""),
      });
    }

    if (selectedStatus !== ALL_FILTER_VALUE) {
      let statusLabel = selectedStatus;
      if (selectedStatus.includes(",")) {
        const statusArray: string[] = selectedStatus.split(",");
        const statusLabels = statusArray
          .map((status: string) => tasks.status[status as TaskStatus])
          .filter(Boolean)
          .join(", ");
        statusLabel = statusLabels || selectedStatus;
      } else {
        statusLabel =
          tasks.status[selectedStatus as TaskStatus] || selectedStatus;
      }

      labels.push({
        label: `${tasks.filters.labels.status}: ${statusLabel}`,
        onClear: () => setSelectedStatus(ALL_FILTER_VALUE),
      });
    }

    if (selectedPriority !== ALL_FILTER_VALUE) {
      labels.push({
        label: `${tasks.filters.labels.priority}: ${tasks.priority[selectedPriority as TaskPriority]}`,
        onClear: () => setSelectedPriority(ALL_FILTER_VALUE),
      });
    }

    if (selectedAssignee !== ALL_FILTER_VALUE) {
      const user = users?.find((u) => u._id === selectedAssignee);
      labels.push({
        label: `${tasks.filters.labels.assignee}: ${user ? formatUserName(user.displayName, user.email) : selectedAssignee}`,
        onClear: () => setSelectedAssignee(ALL_FILTER_VALUE),
      });
    }

    if (selectedDateRange !== "all") {
      const dateLabels: Record<string, string> = tasks.filters.dateLabels;
      labels.push({
        label: `${tasks.filters.labels.date}: ${dateLabels[selectedDateRange] || selectedDateRange}`,
        onClear: () => setSelectedDateRange("all"),
      });
    }

    if (selectedTag !== "all") {
      const tag = tags?.find((t) => t.id === selectedTag);
      labels.push({
        label: `${tasks.filters.labels.tag}: ${tag?.name || selectedTag}`,
        onClear: () => setSelectedTag("all"),
      });
    }

    return labels;
  }, [
    searchTerm,
    selectedStatus,
    selectedPriority,
    selectedAssignee,
    selectedDateRange,
    selectedTag,
    users,
    tags,
    setSearchTerm,
    setSelectedStatus,
    setSelectedPriority,
    setSelectedAssignee,
    setSelectedDateRange,
    setSelectedTag,
  ]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedStatus(ALL_FILTER_VALUE);
    setSelectedPriority(ALL_FILTER_VALUE);
    setSelectedAssignee(ALL_FILTER_VALUE);
    setSelectedDateRange("all");
    setSelectedTag("all");
  };

  const filterSelects = (
    <>
      <FilterSelect
        label={tasks.filters.status}
        value={selectedStatus}
        onChange={(v) =>
          setSelectedStatus(v as TaskStatus | typeof ALL_FILTER_VALUE)
        }
        allLabel={tasks.filters.allStatuses}
        allValue={ALL_FILTER_VALUE}
        options={TASK_STATUS_ORDER.map((s) => ({
          value: s,
          label: tasks.status[s],
        }))}
      />
      <FilterSelect
        label={tasks.filters.priority}
        value={selectedPriority}
        onChange={(v) =>
          setSelectedPriority(v as TaskPriority | typeof ALL_FILTER_VALUE)
        }
        allLabel={tasks.filters.allPriorities}
        allValue={ALL_FILTER_VALUE}
        options={priorityOrder.map((p) => ({
          value: p,
          label: tasks.priority[p],
        }))}
      />
      <FilterSelect
        label={tasks.filters.labels.assignee}
        value={selectedAssignee}
        onChange={(v) =>
          setSelectedAssignee(v as string | typeof ALL_FILTER_VALUE)
        }
        allLabel={tasks.filters.allAssignees}
        allValue={ALL_FILTER_VALUE}
        disabled={isLoadingUsers}
        options={(users ?? []).map((u) => ({
          value: u._id,
          label: formatUserName(u.displayName, u.email),
        }))}
      />
      <FilterSelect
        label={tasks.filters.labels.timeframe}
        value={selectedDateRange}
        onChange={setSelectedDateRange}
        allLabel={tasks.filters.allDates}
        allValue="all"
        options={[
          { value: "today", label: tasks.filters.today },
          { value: "week", label: tasks.filters.thisWeek },
          { value: "month", label: tasks.filters.thisMonth },
          { value: "overdue", label: tasks.filters.overdue },
        ]}
      />
      <FilterSelect
        label={tasks.filters.labels.tags}
        value={selectedTag}
        onChange={setSelectedTag}
        allLabel={tasks.filters.allTags}
        allValue="all"
        disabled={isLoadingTags}
        options={(tags ?? []).map((t) => ({ value: t.id, label: t.name }))}
      />
    </>
  );

  const activeCount = activeFilterLabels.length;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 max-md:basis-full md:max-w-xs">
          <Search className="text-muted-foreground pointer-events-none absolute inset-y-0 start-2.5 my-auto size-3.5" />
          <Input
            placeholder={tasks.filters.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 rounded-lg ps-8 text-xs"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg px-2.5 text-xs md:hidden"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          <SlidersHorizontal className="size-3.5" />
          {tasks.filters.labels.filters}
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-1.5 text-[10px] leading-4">
              {digitsEnToFa(activeCount)}
            </span>
          )}
        </Button>

        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {filterSelects}
        </div>

        <div className="ms-auto flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 gap-1.5 rounded-lg px-2 text-xs text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
            >
              <Eraser className="size-3.5" />
              <span className="max-sm:hidden">
                {tasks.filters.labels.reset}
              </span>
            </Button>
          )}
          {actions}
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-2 gap-2 md:hidden">{filterSelects}</div>
      )}

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeFilterLabels.map((filter) => (
            <ActiveFilterBadge
              key={filter.label}
              label={filter.label}
              onClear={filter.onClear}
            />
          ))}
        </div>
      )}
    </div>
  );
}
