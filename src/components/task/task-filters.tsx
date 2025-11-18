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

import { fa } from "@/constants/text";
import {
  ALL_FILTER_VALUE,
  UseTaskFiltersReturn,
} from "@/hooks/use-task-filters";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
  UsersResponse,
} from "@/lib/pocketbase-types";
import { statusOrder } from "@/lib/tasks-utils";
import { formatUserName } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useTags } from "@/hooks/tags";

// Define priority order here or import from a central place if needed elsewhere
const priorityOrder: TasksPriorityOptions[] = [
  TasksPriorityOptions.low,
  TasksPriorityOptions.medium,
  TasksPriorityOptions.high,
  TasksPriorityOptions.urgent,
];

// Define props based on the hook's return type, excluding filteredTasks, users, and isLoadingUsers
type TaskFiltersProps = Omit<UseTaskFiltersReturn, "filteredTasks"> & {
  users: UsersResponse[] | undefined;
  isLoadingUsers: boolean;
};

// Active filter badge component
const ActiveFilterBadge = ({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) => (
  <Badge
    variant="secondary"
    className="hover:bg-muted/80 cursor-pointer gap-1 pr-1 transition-colors"
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
        label: `${fa.tasks.filters.labels.search} ${searchTerm}`,
        onClear: () => setSearchTerm(""),
      });
    }

    if (selectedStatus !== ALL_FILTER_VALUE) {
      // Handle comma-separated status values
      let statusLabel = selectedStatus;
      if (selectedStatus.includes(",")) {
        const statusArray = selectedStatus.split(",");
        const statusLabels = statusArray
          .map((status) => fa.tasks.status[status as TasksStatusOptions])
          .filter(Boolean)
          .join(", ");
        statusLabel = statusLabels || selectedStatus;
      } else {
        statusLabel =
          fa.tasks.status[selectedStatus as TasksStatusOptions] ||
          selectedStatus;
      }

      labels.push({
        label: `${fa.tasks.filters.labels.status} ${statusLabel}`,
        onClear: () => setSelectedStatus(ALL_FILTER_VALUE),
      });
    }

    if (selectedPriority !== ALL_FILTER_VALUE) {
      labels.push({
        label: `${fa.tasks.filters.labels.priority} ${fa.tasks.priority[selectedPriority as TasksPriorityOptions]}`,
        onClear: () => setSelectedPriority(ALL_FILTER_VALUE),
      });
    }

    if (selectedAssignee !== ALL_FILTER_VALUE) {
      const user = users?.find((u) => u.id === selectedAssignee);
      labels.push({
        label: `${fa.tasks.filters.labels.assignee} ${user ? formatUserName(user.first_name, user.last_name, user.username) : selectedAssignee}`,
        onClear: () => setSelectedAssignee(ALL_FILTER_VALUE),
      });
    }

    if (selectedDateRange !== "all") {
      const dateLabels: Record<string, string> = fa.tasks.filters.dateLabels;
      labels.push({
        label: `${fa.tasks.filters.labels.date} ${dateLabels[selectedDateRange] || selectedDateRange}`,
        onClear: () => setSelectedDateRange("all"),
      });
    }

    if (selectedTag !== "all") {
      const tag = tags?.find((t) => t.id === selectedTag);
      labels.push({
        label: `${fa.tasks.filters.labels.tag} ${tag?.name || selectedTag}`,
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
      {/* Search bar */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder={fa.tasks.filters.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9 pr-10"
        />
      </div>

      {/* Main filters */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <Select
          value={selectedStatus}
          onValueChange={(value) =>
            setSelectedStatus(
              value as TasksStatusOptions | typeof ALL_FILTER_VALUE,
            )
          }
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder={fa.tasks.filters.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER_VALUE}>
              {fa.tasks.filters.allStatuses}
            </SelectItem>
            {statusOrder.map((status) => (
              <SelectItem key={status} value={status}>
                {fa.tasks.status[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedPriority}
          onValueChange={(value) =>
            setSelectedPriority(
              value as TasksPriorityOptions | typeof ALL_FILTER_VALUE,
            )
          }
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder={fa.tasks.filters.priority} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER_VALUE}>
              {fa.tasks.filters.allPriorities}
            </SelectItem>
            {priorityOrder.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {fa.tasks.priority[priority]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedAssignee}
          onValueChange={(value) =>
            setSelectedAssignee(value as string | typeof ALL_FILTER_VALUE)
          }
          disabled={isLoadingUsers}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder={fa.tasks.filters.assignee} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER_VALUE}>
              {fa.tasks.filters.allAssignees}
            </SelectItem>
            {users?.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <span>
                  {formatUserName(
                    user.first_name,
                    user.last_name,
                    user.username,
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder={fa.tasks.filters.date} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{fa.tasks.filters.allDates}</SelectItem>
            <SelectItem value="today">{fa.tasks.filters.today}</SelectItem>
            <SelectItem value="week">{fa.tasks.filters.thisWeek}</SelectItem>
            <SelectItem value="month">{fa.tasks.filters.thisMonth}</SelectItem>
            <SelectItem value="overdue">{fa.tasks.filters.overdue}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedTag}
          onValueChange={setSelectedTag}
          disabled={isLoadingTags}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder={fa.tasks.filters.tag} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{fa.tasks.filters.allTags}</SelectItem>
            {tags?.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span>{tag.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {fa.tasks.filters.activeFilters}
          </span>
          <div className="flex flex-wrap gap-1">
            {getActiveFilterLabels()
              .slice(0, 4)
              .map((filter, index) => (
                <ActiveFilterBadge
                  key={index}
                  label={filter.label}
                  onClear={filter.onClear}
                />
              ))}
            {getActiveFilterLabels().length > 4 && (
              <Badge variant="outline" className="text-xs">
                {fa.tasks.filters.moreFilters.replace(
                  "{count}",
                  (getActiveFilterLabels().length - 4).toString(),
                )}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="hover:bg-muted h-7 px-2 text-xs"
          >
            {fa.tasks.filters.clearAll}
          </Button>
        </div>
      )}
    </div>
  );
}
