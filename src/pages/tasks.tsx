import { FilterX, ListTodo, Plus, CheckSquare } from "lucide-react";
import { useMemo, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fa } from "@/constants/text";
import { useTaskFilters, ALL_FILTER_VALUE } from "@/hooks/use-task-filters";
import { useTasksPageData } from "@/hooks/use-tasks-page-data";
import { useBulkUpdateTasks, useBulkDeleteTasks } from "@/hooks/tasks";
import { useSavedFilters } from "@/hooks/use-saved-filters";
import type { TaskWithProject } from "@/lib/pocketbase";
import {
  TasksStatusOptions,
  TasksPriorityOptions,
} from "@/lib/pocketbase-types";
import { statusOrder } from "@/lib/tasks-utils";

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

  const {
    tasks: userTasks,
    users,
    isLoadingTasks,
    isLoadingUsers,
  } = useTasksPageData();

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
    filteredTasks,
  } = useTaskFilters(userTasks);

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
    } catch (error) {
      console.error("Error applying filter:", error);
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
    } catch (error) {
      console.error("Error setting default:", error);
    }
  };

  // URL params are now handled automatically by useQueryState in the hook

  const groupedTasks = useMemo(() => {
    // Prevent grouping during load state to avoid brief flash of unfiltered/empty groups
    if (isLoadingTasks || !filteredTasks) {
      return {} as Record<TasksStatusOptions, TaskWithProject[]>;
    }
    return filteredTasks.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      },
      {} as Record<TasksStatusOptions, TaskWithProject[]>,
    );
  }, [filteredTasks, isLoadingTasks]);

  const hasActiveFilters = !!(
    searchTerm ||
    selectedStatus !== "all" ||
    selectedPriority !== "all" ||
    selectedAssignee !== "all" ||
    selectedDateRange !== "all" ||
    selectedTag !== "all"
  );

  const totalTasks = filteredTasks?.length || 0;

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

  const availableStatuses: Array<{ value: TasksStatusOptions; label: string }> =
    [
      { value: TasksStatusOptions.todo, label: fa.tasks.status.todo },
      {
        value: TasksStatusOptions.in_progress,
        label: fa.tasks.status.in_progress,
      },
      { value: TasksStatusOptions.pending, label: fa.tasks.status.pending },
      { value: TasksStatusOptions.review, label: fa.tasks.status.review },
      { value: TasksStatusOptions.testing, label: fa.tasks.status.testing },
      { value: TasksStatusOptions.ready, label: fa.tasks.status.ready },
      { value: TasksStatusOptions.blocked, label: fa.tasks.status.blocked },
      { value: TasksStatusOptions.on_hold, label: fa.tasks.status.on_hold },
      { value: TasksStatusOptions.done, label: fa.tasks.status.done },
      { value: TasksStatusOptions.canceled, label: fa.tasks.status.canceled },
    ];

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
        {isLoadingTasks ? (
          <TaskListSkeleton />
        ) : !filteredTasks || filteredTasks.length === 0 ? (
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
