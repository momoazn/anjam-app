import { FilterX, ListTodo, Plus, CheckSquare, LayoutGrid } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TaskFilters } from "@/components/task/task-filters";
import { TaskListGroup } from "@/components/task/task-list-group";
import { BulkActionsBar } from "@/components/task/bulk-actions-bar";
import { SaveFilterDialog } from "@/components/task/save-filter-dialog";
import { SavedFiltersDropdown } from "@/components/task/saved-filters-dropdown";
import { ManageSavedFiltersDialog } from "@/components/task/manage-saved-filters-dialog";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fa } from "@/constants";
import { useTaskFilters, ALL_FILTER_VALUE } from "@/hooks/use-task-filters";
import {
  useTasks,
  useBulkUpdateTasks,
  useBulkDeleteTasks,
} from "@/hooks/tasks";
import { useUsers } from "@/hooks/users";
import { useAuthUser } from "@/store/auth-store";
import { useSavedFilters } from "@/hooks/use-saved-filters";
import type { TaskWithProject } from "@/lib/pocketbase";
import {
  TasksStatusOptions,
  TasksPriorityOptions,
} from "@/lib/pocketbase-types";
import { statusOrder } from "@/lib/status-utils";
import { TASK_STATUS_CONFIG } from "@/lib/status-utils";
import {
  formatISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

// Loading skeleton component
const TaskListSkeleton = () => (
  <div className="space-y-4" data-animate-stagger>
    {statusOrder?.map((status) => (
      <Card key={status} className="overflow-hidden">
        <div className="bg-muted/30 flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-6 rounded" />
          </div>
          <Skeleton className="h-6 w-6 rounded" />
        </div>
        <div className="space-y-2 p-2" data-animate-stagger>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md p-2"
            >
              <div className="flex flex-1 items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    ))}
  </div>
);

// Empty state component
const EmptyState = ({ hasFilters }: { hasFilters: boolean }) => {
  const navigate = useNavigate();

  if (hasFilters) {
    return (
      <Card className="border-dashed">
        <CardContent
          className="flex flex-col items-center justify-center py-12 text-center"
          data-animate-stagger
        >
          <FilterX className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">
            {fa.tasks.emptyState.noTasksFound}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {fa.tasks.emptyState.noTasksFoundDescription}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent
        className="flex flex-col items-center justify-center py-12 text-center"
        data-animate-stagger
      >
        <div
          className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          data-interactive-pulse
        >
          <Plus className="text-primary h-6 w-6" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">
          {fa.tasks.emptyState.noTasksYet}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {fa.tasks.emptyState.noTasksYetDescription}
        </p>
        <Button className="gap-2" onClick={() => navigate("/tasks/new")}>
          <Plus className="h-4 w-4" />
          {fa.tasks.emptyState.createFirstTask}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function Tasks() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [saveFilterDialogOpen, setSaveFilterDialogOpen] = useState(false);
  const [manageFiltersDialogOpen, setManageFiltersDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const authUser = useAuthUser();

  const {
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
  } = useTaskFilters(undefined, { skipFiltering: true });

  const bulkUpdate = useBulkUpdateTasks();
  const bulkDelete = useBulkDeleteTasks();

  // Saved filters functionality
  const {
    savedFilters,
    saveFilter,
    updateFilter,
    deleteFilter,
    setAsDefault,
    defaultFilterId,
    getCurrentFilterMatch,
    isDefaultFilters,
  } = useSavedFilters();

  const currentFilters = {
    searchTerm,
    selectedStatus,
    selectedPriority,
    selectedAssignee,
    selectedDateRange,
    selectedTag,
  };

  const currentFilterMatch = getCurrentFilterMatch(currentFilters);

  // Handle save filter
  const handleSaveFilter = (name: string, setAsDefaultFilter: boolean) => {
    try {
      const newFilter = saveFilter(name, currentFilters);
      if (setAsDefaultFilter) {
        setAsDefault(newFilter.id);
      }
      toast({
        title: fa.savedFilters.toast.saved,
      });
    } catch {
      toast({
        title: fa.savedFilters.toast.saveError,
        variant: "destructive",
      });
    }
  };

  // Handle apply filter
  const handleApplyFilter = async (filter: (typeof savedFilters)[0]) => {
    try {
      await setSearchTerm(filter.filters.searchTerm || "");
      await setSelectedStatus(
        filter.filters.selectedStatus || ALL_FILTER_VALUE,
      );
      await setSelectedPriority(
        filter.filters.selectedPriority || ALL_FILTER_VALUE,
      );
      await setSelectedAssignee(
        filter.filters.selectedAssignee || ALL_FILTER_VALUE,
      );
      await setSelectedDateRange(filter.filters.selectedDateRange || "all");
      await setSelectedTag(filter.filters.selectedTag || "all");

      toast({
        title: fa.savedFilters.toast.applied,
      });
    } catch {
      toast({
        title: fa.savedFilters.toast.applyError,
        variant: "destructive",
      });
    }
  };

  // Handle delete filter
  const handleDeleteFilter = (id: string) => {
    try {
      deleteFilter(id);
      toast({
        title: fa.savedFilters.toast.deleted,
      });
    } catch {
      toast({
        title: fa.savedFilters.toast.deleteError,
        variant: "destructive",
      });
    }
  };

  // Handle set default
  const handleSetDefault = (id: string | null) => {
    try {
      setAsDefault(id);
      toast({
        title: id
          ? fa.savedFilters.toast.defaultSet
          : fa.savedFilters.toast.defaultRemoved,
      });
    } catch {
      toast({
        title: fa.savedFilters.toast.setDefaultError,
        variant: "destructive",
      });
    }
  };

  // URL params are now handled automatically by useQueryState in the hook

  const filterExpression = useMemo(() => {
    const parts: string[] = [];

    if (searchTerm) {
      const term = searchTerm.replace(/"/g, '\\"').toLowerCase();
      parts.push(
        `(lower(title)~"${term}" || lower(assignee.username)~"${term}")`,
      );
    }

    if (selectedStatus !== "all") {
      if (selectedStatus.includes(",")) {
        const statuses = selectedStatus
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (statuses.length > 0) {
          const orExpression = statuses
            .map((status) => `status = "${status}"`)
            .join(" || ");
          parts.push(`(${orExpression})`);
        }
      } else {
        parts.push(`status = "${selectedStatus}"`);
      }
    }

    if (selectedPriority !== "all") {
      parts.push(`priority = "${selectedPriority}"`);
    }

    if (selectedAssignee !== "all") {
      if (selectedAssignee === "me" && authUser?.id) {
        parts.push(`assignee = "${authUser.id}"`);
      } else if (selectedAssignee !== "me") {
        parts.push(`assignee = "${selectedAssignee}"`);
      }
    }

    if (selectedDateRange !== "all") {
      const now = new Date();
      if (selectedDateRange === "overdue") {
        parts.push(
          `(deadline != null && deadline < "${formatISO(
            now,
          )}" && status != "${TasksStatusOptions.done}")`,
        );
      } else {
        let start: Date;
        let end: Date;
        switch (selectedDateRange) {
          case "today":
            start = startOfDay(now);
            end = endOfDay(now);
            break;
          case "week":
            start = startOfWeek(now, { weekStartsOn: 6 });
            end = endOfWeek(now, { weekStartsOn: 6 });
            break;
          case "month":
            start = startOfMonth(now);
            end = endOfMonth(now);
            break;
          default:
            start = startOfDay(now);
            end = endOfDay(now);
        }
        parts.push(
          `(deadline >= "${formatISO(start)}" && deadline <= "${formatISO(
            end,
          )}")`,
        );
      }
    }

    if (selectedTag !== "all") {
      parts.push(`tags ?= "${selectedTag}"`);
    }

    return parts.join(" && ");
  }, [
    authUser?.id,
    searchTerm,
    selectedAssignee,
    selectedDateRange,
    selectedPriority,
    selectedStatus,
    selectedTag,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterExpression]);

  // Fetch users for dropdowns
  const { data: users, isPending: isLoadingUsers } = useUsers({
    batch: 100,
    sort: "-created",
  });

  // Fetch tasks with server-side filtering and pagination
  const taskQuery = useTasks({
    expandFields: "project,assignee",
    mode: "paged",
    page,
    perPage,
    filter: filterExpression || undefined,
  });

  const userTasks = useMemo(
    () => taskQuery.data?.items ?? [],
    [taskQuery.data?.items],
  );
  const totalTasks = taskQuery.data?.totalItems ?? 0;
  const totalPages = taskQuery.data?.totalPages ?? 1;
  const currentPage = taskQuery.data?.page ?? page;
  const currentPerPage = taskQuery.data?.perPage ?? perPage;

  // Keep local pagination in sync with server response
  useEffect(() => {
    if (currentPage !== page) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  useEffect(() => {
    if (currentPerPage !== perPage) {
      setPerPage(currentPerPage);
    }
  }, [currentPerPage, perPage]);

  const groupedTasks = useMemo(() => {
    // Prevent grouping during load state to avoid brief flash of unfiltered/empty groups
    if (taskQuery.isPending || !userTasks) {
      return {} as Record<TasksStatusOptions, TaskWithProject[]>;
    }
    return userTasks.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      },
      {} as Record<TasksStatusOptions, TaskWithProject[]>,
    );
  }, [userTasks, taskQuery.isPending]);

  const hasActiveFilters = !!(
    searchTerm ||
    selectedStatus !== "all" ||
    selectedPriority !== "all" ||
    selectedAssignee !== "all" ||
    selectedDateRange !== "all" ||
    selectedTag !== "all"
  );

  // Bulk operation handlers
  const handleBulkDelete = async () => {
    await bulkDelete.mutateAsync(selectedTasks);
    setSelectedTasks([]);
    setSelectionMode(false);
  };

  const handleBulkAssign = async (assigneeId: string) => {
    await bulkUpdate.mutateAsync({
      taskIds: selectedTasks,
      updates: { assignee: assigneeId },
    });
    setSelectedTasks([]);
  };

  const handleBulkStatus = async (status: TasksStatusOptions) => {
    await bulkUpdate.mutateAsync({
      taskIds: selectedTasks,
      updates: { status },
    });
    setSelectedTasks([]);
  };

  const handleBulkPriority = async (priority: TasksPriorityOptions) => {
    await bulkUpdate.mutateAsync({
      taskIds: selectedTasks,
      updates: { priority },
    });
    setSelectedTasks([]);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedTasks([]);
  };

  const handleSelectionChange = (taskIds: string[]) => {
    setSelectedTasks(taskIds);
  };

  const handlePerPageChange = (value: string) => {
    const next = Number(value);
    if (Number.isFinite(next) && next > 0) {
      setPerPage(next);
      setPage(1);
    }
  };

  const handlePageChange = (nextPage: number) => {
    const clamped = Math.max(1, Math.min(nextPage, totalPages || 1));
    setPage(clamped);
  };

  const pageStart =
    totalTasks === 0 ? 0 : (currentPage - 1) * currentPerPage + 1;
  const pageEnd =
    totalTasks === 0 ? 0 : Math.min(currentPage * currentPerPage, totalTasks);

  // Generate available statuses from centralized configuration
  const availableStatuses: Array<{ value: TasksStatusOptions; label: string }> =
    Object.values(TASK_STATUS_CONFIG).map((config) => ({
      value: config.key,
      label: config.name,
    }));

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <ListTodo className="h-5 w-5 md:h-6 md:w-6" />
            {fa.tasks.allTasks}
          </h1>
          <p className="text-muted-foreground mt-2">
            {totalTasks > 0
              ? fa.tasks.header.tasksFound.replace(
                  "{count}",
                  totalTasks.toString(),
                )
              : fa.tasks.header.manageTasks}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/tasks/board")}
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            {fa.tasks.board.title}
          </Button>
          <Button
            variant={selectionMode ? "secondary" : "outline"}
            size="lg"
            onClick={toggleSelectionMode}
            className="gap-2"
          >
            <CheckSquare className="h-4 w-4" />
            {selectionMode
              ? fa.common.buttons.cancelSelection
              : fa.common.buttons.multiSelect}
          </Button>
          <Button
            className="w-full gap-2 sm:w-auto"
            size="lg"
            onClick={() => navigate("/tasks/new")}
          >
            <Plus className="h-4 w-4" />
            {fa.tasks.addTask.buttons.newTask}
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-8 space-y-3" data-animate-stagger>
        {/* Saved Filters Dropdown */}
        <div className="flex justify-end">
          <SavedFiltersDropdown
            savedFilters={savedFilters}
            currentFilterMatch={currentFilterMatch}
            defaultFilterId={defaultFilterId}
            onApplyFilter={handleApplyFilter}
            onDeleteFilter={handleDeleteFilter}
            onSetDefault={handleSetDefault}
            onOpenSaveDialog={() => setSaveFilterDialogOpen(true)}
            onOpenManageDialog={() => setManageFiltersDialogOpen(true)}
            disabled={isDefaultFilters(currentFilters)}
          />
        </div>

        {/* Filter Controls */}
        <TaskFilters
          searchTerm={searchTerm}
          selectedStatus={selectedStatus}
          selectedPriority={selectedPriority}
          selectedAssignee={selectedAssignee}
          selectedDateRange={selectedDateRange}
          selectedTag={selectedTag}
          setSearchTerm={setSearchTerm}
          setSelectedStatus={setSelectedStatus}
          setSelectedPriority={setSelectedPriority}
          setSelectedAssignee={setSelectedAssignee}
          setSelectedDateRange={setSelectedDateRange}
          setSelectedTag={setSelectedTag}
          users={users}
          isLoadingUsers={isLoadingUsers}
        />
      </div>

      {/* Save Filter Dialog */}
      <SaveFilterDialog
        open={saveFilterDialogOpen}
        onOpenChange={setSaveFilterDialogOpen}
        currentFilters={currentFilters}
        onSave={handleSaveFilter}
      />

      {/* Manage Saved Filters Dialog */}
      <ManageSavedFiltersDialog
        open={manageFiltersDialogOpen}
        onOpenChange={setManageFiltersDialogOpen}
        savedFilters={savedFilters}
        defaultFilterId={defaultFilterId}
        onUpdateFilter={updateFilter}
        onDeleteFilter={handleDeleteFilter}
        onSetDefault={handleSetDefault}
      />

      {/* Task List */}
      <div className="space-y-6" data-animate-stagger>
        {taskQuery.isPending ? (
          <TaskListSkeleton />
        ) : totalTasks === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} />
        ) : (
          statusOrder?.map((status) => {
            const tasksInGroup = groupedTasks?.[status] ?? [];
            return (
              <TaskListGroup
                key={status}
                taskCount={tasksInGroup.length}
                status={status}
                tasks={tasksInGroup}
                showProject={true}
                enableSelection={selectionMode}
                selectedTasks={selectedTasks}
                onSelectionChange={handleSelectionChange}
              />
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {!taskQuery.isPending && totalTasks > 0 && (
        <Card className="mt-6">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-muted-foreground text-sm">
              {fa.tasks.pagination.range
                .replace("{start}", pageStart.toString())
                .replace("{end}", pageEnd.toString())
                .replace("{total}", totalTasks.toString())}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={currentPerPage.toString()}
                onValueChange={handlePerPageChange}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[25, 50, 100, 200, 500].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {fa.tasks.pagination.perPage.replace(
                        "{count}",
                        size.toString(),
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  {fa.tasks.pagination.prev}
                </Button>
                <span className="text-muted-foreground text-sm">
                  {fa.tasks.pagination.page
                    .replace("{page}", currentPage.toString())
                    .replace("{total}", totalPages.toString())}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  {fa.tasks.pagination.next}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions Bar */}
      {selectionMode && selectedTasks.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedTasks.length}
          onClearSelection={() => setSelectedTasks([])}
          onBulkDelete={handleBulkDelete}
          onBulkAssign={handleBulkAssign}
          onBulkStatus={handleBulkStatus}
          onBulkPriority={handleBulkPriority}
          users={users || []}
          availableStatuses={availableStatuses}
        />
      )}
    </PageTransition>
  );
}
