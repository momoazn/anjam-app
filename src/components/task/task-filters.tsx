import {
  Calendar,
  Eraser,
  Filter,
  Hash,
  Search,
  Tag,
  User,
  X,
} from "lucide-react";
import { useMemo } from "react";

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
import { statusOrder } from "@/lib/status-utils";
import { formatUserName } from "@/lib/utils";
import { TaskPriority, TaskStatus } from "@/types/tasks";

// User type with compatibility fields
interface UserWithCompat {
  id: string;
  _id: string;
  username?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
}

const priorityOrder: TaskPriority[] = ["low", "medium", "high", "urgent"];

type TaskFiltersProps = Omit<
  UseTaskFiltersReturn<FilterableTask>,
  "filteredTasks"
> & {
  users: UserWithCompat[] | undefined;
  isLoadingUsers: boolean;
};

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
}: TaskFiltersProps) {
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
      const user = users?.find((u) => u.id === selectedAssignee);
      labels.push({
        label: `${tasks.filters.labels.assignee}: ${user ? formatUserName(user.first_name, user.last_name, user.username) : selectedAssignee}`,
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

  return (
    <div className="space-y-3">
      {/* Search & Global Reset Segment */}
      <div className="bg-card border-border/40 flex items-center gap-2 overflow-hidden rounded-xl border p-1.5 shadow-sm">
        <div className="bg-muted/30 flex h-9 shrink-0 items-center gap-2 rounded-lg px-3">
          <Search className="text-muted-foreground/60 size-3.5" />
          <span className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
            {tasks.filters.labels.search}
          </span>
        </div>

        <div className="group relative h-9 flex-1">
          <Input
            placeholder={tasks.filters.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-full border-none bg-transparent px-3 text-xs font-medium tracking-tight transition-all focus:ring-0"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-9 gap-2 rounded-lg px-4 text-[10px] font-bold tracking-tight text-rose-500 transition-all hover:bg-rose-500/10 hover:text-rose-600"
          >
            <Eraser className="size-3.5" />
            {tasks.filters.labels.reset}
          </Button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {/* Status Filter */}
        <div className="bg-card border-border/40 flex flex-col justify-between rounded-xl border p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between opacity-60">
            <span className="text-[9px] font-bold tracking-tight">
              {tasks.filters.status}
            </span>
            <Filter className="size-3" />
          </div>
          <Select
            value={selectedStatus}
            onValueChange={(value) =>
              setSelectedStatus(value as TaskStatus | typeof ALL_FILTER_VALUE)
            }
          >
            <SelectTrigger className="bg-muted/30 h-8 w-full rounded-lg border-none px-3 text-[11px] font-bold tracking-tight focus:ring-0">
              <SelectValue placeholder={tasks.filters.status} />
            </SelectTrigger>
            <SelectContent className="border-border/40 bg-card rounded-lg border shadow-md">
              <SelectItem
                value={ALL_FILTER_VALUE}
                className="text-[11px] font-medium"
              >
                {tasks.filters.allStatuses}
              </SelectItem>
              {statusOrder.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="text-[11px] font-medium"
                >
                  {tasks.status[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="bg-card border-border/40 flex flex-col justify-between rounded-xl border p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between opacity-60">
            <span className="text-[9px] font-bold tracking-tight">
              {tasks.filters.priority}
            </span>
            <Hash className="size-3" />
          </div>
          <Select
            value={selectedPriority}
            onValueChange={(value) =>
              setSelectedPriority(
                value as TaskPriority | typeof ALL_FILTER_VALUE,
              )
            }
          >
            <SelectTrigger className="bg-muted/30 h-8 w-full rounded-lg border-none px-3 text-[11px] font-bold tracking-tight focus:ring-0">
              <SelectValue placeholder={tasks.filters.priority} />
            </SelectTrigger>
            <SelectContent className="border-border/40 bg-card rounded-lg border shadow-md">
              <SelectItem
                value={ALL_FILTER_VALUE}
                className="text-[11px] font-medium"
              >
                {tasks.filters.allPriorities}
              </SelectItem>
              {priorityOrder.map((priority) => (
                <SelectItem
                  key={priority}
                  value={priority}
                  className="text-[11px] font-medium"
                >
                  {tasks.priority[priority]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assignee Filter */}
        <div className="bg-card border-border/40 flex flex-col justify-between rounded-xl border p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between opacity-60">
            <span className="text-[9px] font-bold tracking-tight">
              {tasks.filters.labels.assignee}
            </span>
            <User className="size-3" />
          </div>
          <Select
            value={selectedAssignee}
            onValueChange={(value) =>
              setSelectedAssignee(value as string | typeof ALL_FILTER_VALUE)
            }
            disabled={isLoadingUsers}
          >
            <SelectTrigger className="bg-muted/30 h-8 w-full rounded-lg border-none px-3 text-[11px] font-bold tracking-tight focus:ring-0">
              <SelectValue placeholder={tasks.filters.assignee} />
            </SelectTrigger>
            <SelectContent className="border-border/40 bg-card rounded-lg border shadow-md">
              <SelectItem
                value={ALL_FILTER_VALUE}
                className="text-[11px] font-medium"
              >
                {tasks.filters.allAssignees}
              </SelectItem>
              {users?.map((user) => (
                <SelectItem
                  key={user.id}
                  value={user.id}
                  className="text-[11px] font-medium"
                >
                  {formatUserName(
                    user.first_name,
                    user.last_name,
                    user.username,
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Filter */}
        <div className="bg-card border-border/40 flex flex-col justify-between rounded-xl border p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between opacity-60">
            <span className="text-[9px] font-bold tracking-tight">
              {tasks.filters.labels.timeframe}
            </span>
            <Calendar className="size-3" />
          </div>
          <Select
            value={selectedDateRange}
            onValueChange={setSelectedDateRange}
          >
            <SelectTrigger className="bg-muted/30 h-8 w-full rounded-lg border-none px-3 text-[11px] font-bold tracking-tight focus:ring-0">
              <SelectValue placeholder={tasks.filters.date} />
            </SelectTrigger>
            <SelectContent className="border-border/40 bg-card rounded-lg border shadow-md">
              <SelectItem value="all" className="text-[11px] font-medium">
                {tasks.filters.allDates}
              </SelectItem>
              <SelectItem value="today" className="text-[11px] font-medium">
                {tasks.filters.today}
              </SelectItem>
              <SelectItem value="week" className="text-[11px] font-medium">
                {tasks.filters.thisWeek}
              </SelectItem>
              <SelectItem value="month" className="text-[11px] font-medium">
                {tasks.filters.thisMonth}
              </SelectItem>
              <SelectItem value="overdue" className="text-[11px] font-medium">
                {tasks.filters.overdue}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tag Filter */}
        <div className="bg-card border-border/40 flex flex-col justify-between rounded-xl border p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between opacity-60">
            <span className="text-[9px] font-bold tracking-tight">
              {tasks.filters.labels.tags}
            </span>
            <Tag className="size-3" />
          </div>
          <Select
            value={selectedTag}
            onValueChange={(value) => setSelectedTag(value)}
            disabled={isLoadingTags}
          >
            <SelectTrigger className="bg-muted/30 h-8 w-full rounded-lg border-none px-3 text-[11px] font-bold tracking-tight focus:ring-0">
              <SelectValue placeholder={tasks.filters.tag} />
            </SelectTrigger>
            <SelectContent className="border-border/40 bg-card rounded-lg border shadow-md">
              <SelectItem value="all" className="text-[11px] font-medium">
                {tasks.filters.allTags}
              </SelectItem>
              {tags?.map((tag) => (
                <SelectItem
                  key={tag.id}
                  value={tag.id}
                  className="text-[11px] font-medium"
                >
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="bg-primary/5 border-primary/10 flex items-center gap-3 overflow-hidden rounded-xl border p-2.5 shadow-sm">
          <div className="flex shrink-0 items-center gap-2 px-1">
            <Filter className="text-primary/60 size-3" />
            <span className="text-primary/60 text-[10px] font-bold tracking-tight">
              {tasks.filters.labels.activeFilters}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {activeFilterLabels.map((filter) => (
              <ActiveFilterBadge
                key={filter.label}
                label={filter.label}
                onClear={filter.onClear}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
