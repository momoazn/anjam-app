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
import {
  ALL_FILTER_VALUE,
  type UseTaskFiltersReturn,
} from "@/hooks/use-task-filters";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
  type UsersResponse,
} from "@/lib/pocketbase-types";
import { statusOrder } from "@/lib/status-utils";
import { formatUserName } from "@/lib/utils";
import {
  Search,
  X,
  Filter,
  Hash,
  Eraser,
  User,
  Calendar,
  Tag,
} from "lucide-react";
import { useTags } from "@/hooks/tags";

const priorityOrder: TasksPriorityOptions[] = [
  TasksPriorityOptions.low,
  TasksPriorityOptions.medium,
  TasksPriorityOptions.high,
  TasksPriorityOptions.urgent,
];

type TaskFiltersProps = Omit<UseTaskFiltersReturn, "filteredTasks"> & {
  users: UsersResponse[] | undefined;
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
    className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary cursor-pointer gap-2 rounded-lg border ps-1 text-[10px] font-bold tracking-tight transition-all"
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

  const hasActiveFilters = !!(
    searchTerm ||
    selectedStatus !== ALL_FILTER_VALUE ||
    selectedPriority !== ALL_FILTER_VALUE ||
    selectedAssignee !== ALL_FILTER_VALUE ||
    selectedDateRange !== "all" ||
    selectedTag !== "all"
  );

  const getActiveFilterLabels = () => {
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
        const statusArray = selectedStatus.split(",");
        const statusLabels = statusArray
          .map((status) => tasks.status[status as TasksStatusOptions])
          .filter(Boolean)
          .join(", ");
        statusLabel = statusLabels || selectedStatus;
      } else {
        statusLabel =
          tasks.status[selectedStatus as TasksStatusOptions] || selectedStatus;
      }

      labels.push({
        label: `${tasks.filters.labels.status}: ${statusLabel}`,
        onClear: () => setSelectedStatus(ALL_FILTER_VALUE),
      });
    }

    if (selectedPriority !== ALL_FILTER_VALUE) {
      labels.push({
        label: `${tasks.filters.labels.priority}: ${tasks.priority[selectedPriority as TasksPriorityOptions]}`,
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
  };

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
      <div className="bg-card border-border/40 flex items-center gap-2 overflow-hidden rounded-2xl border p-1.5 shadow-sm">
        <div className="bg-muted/30 flex h-9 shrink-0 items-center gap-2 rounded-xl px-3">
          <Search className="text-muted-foreground/60 size-3.5" />
          <span className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
            Search
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
            className="h-9 gap-2 rounded-xl px-4 text-[10px] font-bold tracking-tight text-rose-500 transition-all hover:bg-rose-500/10 hover:text-rose-600"
          >
            <Eraser className="size-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {/* Status Filter */}
        <div className="bg-card border-border/40 flex flex-col justify-between rounded-2xl border p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between opacity-60">
            <span className="text-[9px] font-bold tracking-tight">
              {tasks.filters.status}
            </span>
            <Filter className="size-3" />
          </div>
          <Select
            value={selectedStatus}
            onValueChange={(value) =>
              setSelectedStatus(
                value as TasksStatusOptions | typeof ALL_FILTER_VALUE,
              )
            }
          >
            <SelectTrigger className="bg-muted/30 h-8 w-full rounded-xl border-none px-3 text-[11px] font-bold tracking-tight focus:ring-0">
              <SelectValue placeholder={tasks.filters.status} />
            </SelectTrigger>
            <SelectContent className="border-border/40 bg-card rounded-xl border shadow-lg">
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
        <div className="bg-card border-border/40 flex flex-col justify-between rounded-2xl border p-3 shadow-sm">
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
                value as TasksPriorityOptions | typeof ALL_FILTER_VALUE,
              )
            }
          >
            <SelectTrigger className="bg-muted/30 h-8 w-full rounded-xl border-none px-3 text-[11px] font-bold tracking-tight focus:ring-0">
              <SelectValue placeholder={tasks.filters.priority} />
            </SelectTrigger>
            <SelectContent className="border-border/40 bg-card rounded-xl border shadow-lg">
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
        <div className="bg-card border-border/40 flex flex-col justify-between rounded-2xl border p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between opacity-60">
            <span className="text-[9px] font-bold tracking-tight">
              Assignee
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
            <SelectTrigger className="bg-muted/30 h-8 w-full rounded-xl border-none px-3 text-[11px] font-bold tracking-tight focus:ring-0">
              <SelectValue placeholder={tasks.filters.assignee} />
            </SelectTrigger>
            <SelectContent className="border-border/40 bg-card rounded-xl border shadow-lg">
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
        <div className="bg-card border-border/40 flex flex-col justify-between rounded-2xl border p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between opacity-60">
            <span className="text-[9px] font-bold tracking-tight">
              Timeframe
            </span>
            <Calendar className="size-3" />
          </div>
          <Select
            value={selectedDateRange}
            onValueChange={setSelectedDateRange}
          >
            <SelectTrigger className="bg-muted/30 h-8 w-full rounded-xl border-none px-3 text-[11px] font-bold tracking-tight focus:ring-0">
              <SelectValue placeholder={tasks.filters.date} />
            </SelectTrigger>
            <SelectContent className="border-border/40 bg-card rounded-xl border shadow-lg">
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
        <div className="bg-card border-border/40 flex flex-col justify-between rounded-2xl border p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between opacity-60">
            <span className="text-[9px] font-bold tracking-tight">Tags</span>
            <Tag className="size-3" />
          </div>
          <Select
            value={selectedTag}
            onValueChange={(value) => setSelectedTag(value)}
            disabled={isLoadingTags}
          >
            <SelectTrigger className="bg-muted/30 h-8 w-full rounded-xl border-none px-3 text-[11px] font-bold tracking-tight focus:ring-0">
              <SelectValue placeholder={tasks.filters.tag} />
            </SelectTrigger>
            <SelectContent className="border-border/40 bg-card rounded-xl border shadow-lg">
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
        <div className="bg-primary/5 border-primary/10 flex items-center gap-3 overflow-hidden rounded-2xl border p-2.5 shadow-sm">
          <div className="flex shrink-0 items-center gap-2 px-1">
            <Filter className="text-primary/60 size-3" />
            <span className="text-primary/60 text-[10px] font-bold tracking-tight">
              Active Filters
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {getActiveFilterLabels().map((filter) => (
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
