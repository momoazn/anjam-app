import { digitsEnToFa } from "@persian-tools/persian-tools";
import { CheckSquare, LayoutGrid, ListTodo, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { Toolbar, ToolbarSeparator } from "@/components/recipes/toolbar";
import { BulkActionsBar } from "@/components/task/bulk-actions-bar";
import { TaskFiltersPanel } from "@/components/task/task-filters-panel";
import { TaskListView } from "@/components/task/task-list-view";
import { TaskPagination } from "@/components/task/task-pagination";
import { Button } from "@/components/ui/button";
import { common, savedFilters as savedFiltersText, tasks } from "@/constants";
import {
  useBulkDeleteTasks,
  useBulkUpdateTasks,
  useTasks,
} from "@/hooks/tasks";
import { useSavedFilters } from "@/hooks/use-saved-filters";
import { ALL_FILTER_VALUE, useTaskFilters } from "@/hooks/use-task-filters";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/hooks/users";
import { TASK_STATUS_CONFIG, statusOrder } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { useAuthUser, useCurrentOrgMode } from "@/store/auth-store";
import { Task, TaskPriority, TaskStatus } from "@/types/tasks";

// Define a local interface for tasks with expanded properties
interface TaskWithProject extends Task {
  project?: { name: string };
  assignee?: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
  } | null;
  display_id?: string;
}

type TasksProps = {
  viewMode?: "tasks" | "issues";
};

export default function Tasks({ viewMode = "tasks" }: TasksProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
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

  const {
    savedFilters: savedFiltersData,
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

  const handleSaveFilter = (name: string, setAsDefaultFilter: boolean) => {
    try {
      const newFilter = saveFilter(name, currentFilters);
      if (setAsDefaultFilter) {
        setAsDefault(newFilter.id);
      }
      toast({
        title: savedFiltersText.toast.saved,
      });
    } catch {
      toast({
        title: savedFiltersText.toast.saveError,
        variant: "destructive",
      });
    }
  };

  const handleApplyFilter = async (filter: (typeof savedFiltersData)[0]) => {
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
        title: savedFiltersText.toast.applied,
      });
    } catch {
      toast({
        title: savedFiltersText.toast.applyError,
        variant: "destructive",
      });
    }
  };

  const handleDeleteFilter = (id: string) => {
    try {
      deleteFilter(id);
      toast({
        title: savedFiltersText.toast.deleted,
      });
    } catch {
      toast({
        title: savedFiltersText.toast.deleteError,
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = (id: string | null) => {
    try {
      setAsDefault(id);
      toast({
        title: id
          ? savedFiltersText.toast.defaultSet
          : savedFiltersText.toast.defaultRemoved,
      });
    } catch {
      toast({
        title: savedFiltersText.toast.setDefaultError,
        variant: "destructive",
      });
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [
    searchTerm,
    selectedStatus,
    selectedPriority,
    selectedAssignee,
    selectedDateRange,
    selectedTag,
  ]);

  const { data: users, isPending: isLoadingUsers } = useUsers({
    enabled: true,
  });

  const taskQuery = useTasks({
    page,
    perPage,
    searchTerm: searchTerm || undefined,
    status: selectedStatus === "all" ? undefined : selectedStatus,
    priority: selectedPriority === "all" ? undefined : selectedPriority,
    assigneeUserId:
      selectedAssignee === "all"
        ? undefined
        : selectedAssignee === "me"
          ? authUser?._id
          : selectedAssignee,
  });

  const totalTasks = taskQuery.data?.totalItems ?? 0;
  const totalPages = taskQuery.data?.totalPages ?? 1;

  const groupedTasks = useMemo(() => {
    const items = taskQuery.data?.items;
    if (taskQuery.isPending || !items) {
      return {} as Record<TaskStatus, TaskWithProject[]>;
    }
    return items.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc: any, task: any) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      },
      {} as Record<TaskStatus, TaskWithProject[]>,
    );
  }, [taskQuery.data?.items, taskQuery.isPending]);

  const hasActiveFilters = !!(
    searchTerm ||
    selectedStatus !== "all" ||
    selectedPriority !== "all" ||
    selectedAssignee !== "all" ||
    selectedDateRange !== "all" ||
    selectedTag !== "all"
  );

  const handleBulkDelete = async () => {
    await bulkDelete.mutateAsync(selectedTasks);
    setSelectedTasks([]);
    setSelectionMode(false);
  };

  const handleBulkAssign = async (assigneeId: string) => {
    await bulkUpdate.mutateAsync({
      ids: selectedTasks,
      updates: { assignee: assigneeId },
    });
    setSelectedTasks([]);
  };

  const handleBulkStatus = async (status: TaskStatus) => {
    await bulkUpdate.mutateAsync({
      ids: selectedTasks,
      updates: { status },
    });
    setSelectedTasks([]);
  };

  const handleBulkPriority = async (priority: TaskPriority) => {
    await bulkUpdate.mutateAsync({
      ids: selectedTasks,
      updates: { priority },
    });
    setSelectedTasks([]);
  };

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => !prev);
    setSelectedTasks([]);
  }, []);

  const handleSelectionChange = useCallback((taskIds: string[]) => {
    setSelectedTasks(taskIds);
  }, []);

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

  const pageStart = totalTasks === 0 ? 0 : (page - 1) * perPage + 1;
  const pageEnd = totalTasks === 0 ? 0 : Math.min(page * perPage, totalTasks);

  const availableStatuses: Array<{ value: TaskStatus; label: string }> =
    Object.values(TASK_STATUS_CONFIG).map((config) => ({
      value: config.key,
      label: config.name,
    }));

  return (
    <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
      <PageHeader
        icon={ListTodo}
        title={viewMode === "issues" ? "مشکلات گزارش شده" : tasks.allTasks}
        subtitle={
          totalTasks > 0
            ? tasks.header.tasksFound.replace(
                "{count}",
                digitsEnToFa(totalTasks).toString(),
              )
            : viewMode === "issues"
              ? "مشکلات گزارش شده را مدیریت کنید"
              : tasks.header.manageTasks
        }
        actions={
          <div className="flex items-center gap-2">
            <Toolbar variant="transparent" className="p-0 gap-0">
              <Button
                variant="ghost"
                onClick={() => navigate("/tasks/board")}
                className={cn(
                  "gap-2",
                  isProductMode
                    ? "h-8 px-3 text-xs font-semibold"
                    : "h-10 px-4 text-sm font-bold",
                )}
              >
                <LayoutGrid className="size-4" />
                <span>{tasks.board.title}</span>
              </Button>

              <ToolbarSeparator className="bg-border/40 mx-2 h-5 w-px" />

              <Button
                variant="ghost"
                onClick={toggleSelectionMode}
                className={cn(
                  "gap-2",
                  isProductMode
                    ? "h-8 px-3 text-xs font-semibold"
                    : "h-10 px-4 text-sm font-bold",
                  selectionMode &&
                    "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30",
                )}
              >
                <CheckSquare className="size-4" />
                <span>
                  {selectionMode
                    ? common.buttons.cancelSelection
                    : common.buttons.multiSelect}
                </span>
              </Button>
            </Toolbar>

            <Button
              className={cn(
                "gap-2 rounded-lg shadow-sm transition-all",
                isProductMode
                  ? "h-8 px-3 text-xs font-semibold"
                  : "h-10 px-5 text-sm font-bold hover:scale-[1.02]",
              )}
              onClick={() => navigate("/tasks/new")}
            >
              <Plus className="size-4.5" />
              <span>{tasks.addTask.buttons.newTask}</span>
            </Button>
          </div>
        }
      />

      <TaskFiltersPanel
        currentFilters={currentFilters}
        savedFilters={savedFiltersData}
        currentFilterMatch={currentFilterMatch}
        defaultFilterId={defaultFilterId}
        disableSave={isDefaultFilters(currentFilters)}
        onSaveFilter={handleSaveFilter}
        onApplyFilter={handleApplyFilter}
        onUpdateFilter={updateFilter}
        onDeleteFilter={handleDeleteFilter}
        onSetDefault={handleSetDefault}
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

      <div
        className={cn("space-y-10", isProductMode && "space-y-4")}
        data-animate-stagger
      >
        <TaskListView
          isLoading={taskQuery.isPending}
          totalTasks={totalTasks}
          hasActiveFilters={hasActiveFilters}
          statusOrder={statusOrder}
          groupedTasks={groupedTasks}
          selectionMode={selectionMode}
          selectedTasks={selectedTasks}
          onSelectionChange={handleSelectionChange}
        />
      </div>

      {!taskQuery.isPending && totalTasks > 0 && (
        <div
          className={cn(
            "border-border/20 border-t",
            isProductMode ? "mt-6 pt-6" : "mt-10 pt-10",
          )}
        >
          <TaskPagination
            totalTasks={totalTasks}
            pageStart={pageStart}
            pageEnd={pageEnd}
            currentPage={page}
            totalPages={totalPages}
            currentPerPage={perPage}
            onPerPageChange={handlePerPageChange}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {selectionMode && selectedTasks.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedTasks.length}
          onClearSelection={() => setSelectedTasks([])}
          onBulkDelete={handleBulkDelete}
          onBulkAssign={handleBulkAssign}
          onBulkStatus={handleBulkStatus}
          onBulkPriority={handleBulkPriority}
          users={
            users?.map((u) => ({
              ...u,
              id: u._id,
              username: u.username || u.email || "",
            })) || []
          }
          availableStatuses={availableStatuses}
        />
      )}
    </PageTransition>
  );
}
