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
  Terminal,
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
    className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary cursor-pointer gap-2 rounded-none border ps-1 text-[9px] font-black tracking-tight uppercase transition-all"
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
        label: `${tasks.filters.labels.search} ${searchTerm}`,
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
        label: `${tasks.filters.labels.status} ${statusLabel}`,
        onClear: () => setSelectedStatus(ALL_FILTER_VALUE),
      });
    }

    if (selectedPriority !== ALL_FILTER_VALUE) {
      labels.push({
        label: `${tasks.filters.labels.priority} ${tasks.priority[selectedPriority as TasksPriorityOptions]}`,
        onClear: () => setSelectedPriority(ALL_FILTER_VALUE),
      });
    }

    if (selectedAssignee !== ALL_FILTER_VALUE) {
      const user = users?.find((u) => u.id === selectedAssignee);
      labels.push({
        label: `${tasks.filters.labels.assignee} ${user ? formatUserName(user.first_name, user.last_name, user.username) : selectedAssignee}`,
        onClear: () => setSelectedAssignee(ALL_FILTER_VALUE),
      });
    }

    if (selectedDateRange !== "all") {
      const dateLabels: Record<string, string> = tasks.filters.dateLabels;
      labels.push({
        label: `${tasks.filters.labels.date} ${dateLabels[selectedDateRange] || selectedDateRange}`,
        onClear: () => setSelectedDateRange("all"),
      });
    }

    if (selectedTag !== "all") {
      const tag = tags?.find((t) => t.id === selectedTag);
      labels.push({
        label: `${tasks.filters.labels.tag} ${tag?.name || selectedTag}`,
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
    <div className="space-y-2">
      {/* Search & Global Reset Segment - Ultra Compact */}
      <div className="bg-border/40 border-border/40 flex items-center gap-px overflow-hidden border">
        <div className="bg-muted/20 border-border/20 flex h-9 shrink-0 items-center gap-2 border-s px-3">
          <Terminal className="text-primary/60 size-3" />
          <span className="text-muted-foreground/60 text-[8px] font-black tracking-tight uppercase">
            Search
          </span>
        </div>

        <div className="group relative h-9 flex-1">
          <Search className="text-muted-foreground/30 group-focus-within:text-primary absolute end-3.5 top-1/2 h-3 w-3 -translate-y-1/2 transition-colors" />
          <Input
            placeholder={tasks.filters.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-full rounded-none border-none bg-transparent pe-10 text-xs font-bold tracking-tight transition-all focus:ring-0"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="border-border/20 h-9 gap-2 rounded-none border-e px-4 text-[8px] font-black tracking-tight text-rose-500 uppercase transition-all hover:bg-rose-500/10 hover:text-rose-600"
          >
            <Eraser className="size-3" />
            Reset
          </Button>
        )}
      </div>

      {/* Logic Gates Grid - Strictly Aligned Column Layout */}
      <div className="bg-border/40 border-border/40 grid grid-cols-2 gap-px overflow-hidden border sm:grid-cols-3 md:grid-cols-5">
        {/* Status Gate */}
        <div className="bg-card flex min-h-[4rem] flex-col justify-between p-2.5">
          <div className="mb-1 flex items-center justify-end gap-1.5 opacity-40">
            <span className="text-[7px] font-black tracking-tight uppercase">
              {tasks.filters.status}
            </span>
            <Filter className="size-2" />
          </div>
          <Select
            value={selectedStatus}
            onValueChange={(value) =>
              setSelectedStatus(
                value as TasksStatusOptions | typeof ALL_FILTER_VALUE,
              )
            }
          >
            <SelectTrigger className="bg-muted/10 h-7 w-full rounded-none border-none px-2 text-right text-[11px] font-black tracking-tight uppercase focus:ring-0">
              <SelectValue placeholder={tasks.filters.status} />
            </SelectTrigger>
            <SelectContent className="border-border bg-card rounded-none border">
              <SelectItem
                value={ALL_FILTER_VALUE}
                className="text-[10px] font-black uppercase"
              >
                {tasks.filters.allStatuses}
              </SelectItem>
              {statusOrder.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="text-[10px] font-black uppercase"
                >
                  {tasks.status[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Gate */}
        <div className="bg-card flex min-h-[4rem] flex-col justify-between p-2.5">
          <div className="mb-1 flex items-center justify-end gap-1.5 opacity-40">
            <span className="text-[7px] font-black tracking-tight uppercase">
              {tasks.filters.priority}
            </span>
            <Hash className="size-2" />
          </div>
          <Select
            value={selectedPriority}
            onValueChange={(value) =>
              setSelectedPriority(
                value as TasksPriorityOptions | typeof ALL_FILTER_VALUE,
              )
            }
          >
            <SelectTrigger className="bg-muted/10 h-7 w-full rounded-none border-none px-2 text-right text-[11px] font-black tracking-tight uppercase focus:ring-0">
              <SelectValue placeholder={tasks.filters.priority} />
            </SelectTrigger>
            <SelectContent className="border-border bg-card rounded-none border">
              <SelectItem
                value={ALL_FILTER_VALUE}
                className="text-[10px] font-black uppercase"
              >
                {tasks.filters.allPriorities}
              </SelectItem>
              {priorityOrder.map((priority) => (
                <SelectItem
                  key={priority}
                  value={priority}
                  className="text-[10px] font-black uppercase"
                >
                  {tasks.priority[priority]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assignee Gate */}
        <div className="bg-card flex min-h-[4rem] flex-col justify-between p-2.5">
          <div className="mb-1 flex items-center justify-end gap-1.5 opacity-40">
            <span className="text-[7px] font-black tracking-tight uppercase">
              Operator_ID
            </span>
            <User className="size-2" />
          </div>
          <Select
            value={selectedAssignee}
            onValueChange={(value) =>
              setSelectedAssignee(value as string | typeof ALL_FILTER_VALUE)
            }
            disabled={isLoadingUsers}
          >
            <SelectTrigger className="bg-muted/10 h-7 w-full rounded-none border-none px-2 text-right text-[11px] font-black tracking-tight uppercase focus:ring-0">
              <SelectValue placeholder={tasks.filters.assignee} />
            </SelectTrigger>
            <SelectContent className="border-border bg-card rounded-none border">
              <SelectItem
                value={ALL_FILTER_VALUE}
                className="text-[10px] font-black uppercase"
              >
                {tasks.filters.allAssignees}
              </SelectItem>
              {users?.map((user) => (
                <SelectItem
                  key={user.id}
                  value={user.id}
                  className="text-[10px] font-bold uppercase"
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

        {/* Date Gate */}
        <div className="bg-card flex min-h-[4rem] flex-col justify-between p-2.5">
          <div className="mb-1 flex items-center justify-end gap-1.5 opacity-40">
            <span className="text-[7px] font-black tracking-tight uppercase">
              Time_Frame
            </span>
            <Calendar className="size-2" />
          </div>
          <Select
            value={selectedDateRange}
            onValueChange={setSelectedDateRange}
          >
            <SelectTrigger className="bg-muted/10 h-7 w-full rounded-none border-none px-2 text-right text-[11px] font-black tracking-tight uppercase focus:ring-0">
              <SelectValue placeholder={tasks.filters.date} />
            </SelectTrigger>
            <SelectContent className="border-border bg-card rounded-none border">
              <SelectItem
                value="all"
                className="text-[10px] font-black uppercase"
              >
                {tasks.filters.allDates}
              </SelectItem>
              <SelectItem
                value="today"
                className="text-[10px] font-black uppercase"
              >
                {tasks.filters.today}
              </SelectItem>
              <SelectItem
                value="week"
                className="text-[10px] font-black uppercase"
              >
                {tasks.filters.thisWeek}
              </SelectItem>
              <SelectItem
                value="month"
                className="text-[10px] font-black uppercase"
              >
                {tasks.filters.thisMonth}
              </SelectItem>
              <SelectItem
                value="overdue"
                className="text-[10px] font-black uppercase"
              >
                {tasks.filters.overdue}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tag Gate */}
        <div className="bg-card flex min-h-[4rem] flex-col justify-between p-2.5">
          <div className="mb-1 flex items-center justify-end gap-1.5 opacity-40">
            <span className="text-[7px] font-black tracking-tight uppercase">
              Tag_Index
            </span>
            <Tag className="size-2" />
          </div>
          <Select
            value={selectedTag}
            onValueChange={(value) => setSelectedTag(value)}
            disabled={isLoadingTags}
          >
            <SelectTrigger className="bg-muted/10 h-7 w-full rounded-none border-none px-2 text-right text-[11px] font-black tracking-tight uppercase focus:ring-0">
              <SelectValue placeholder={tasks.filters.tag} />
            </SelectTrigger>
            <SelectContent className="border-border bg-card rounded-none border">
              <SelectItem
                value="all"
                className="text-[10px] font-black uppercase"
              >
                {tasks.filters.allTags}
              </SelectItem>
              {tags?.map((tag) => (
                <SelectItem
                  key={tag.id}
                  value={tag.id}
                  className="text-[10px] font-bold uppercase"
                >
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Stack Feed - Inline Display */}
      {hasActiveFilters && (
        <div className="bg-primary/5 border-primary/20 flex items-center gap-3 overflow-hidden border p-2 shadow-sm">
          <div className="flex shrink-0 items-center gap-2">
            <Terminal className="text-primary/60 size-2.5" />
            <span className="text-primary/60 text-[8px] font-black tracking-tight uppercase">
              Gates_Open
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
