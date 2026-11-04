import { digitsEnToFa } from "@persian-tools/persian-tools";
import { CheckSquare, LayoutGrid, ListTodo, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { Toolbar, ToolbarSeparator } from "@/components/recipes/toolbar";
import { BulkActionsBar } from "@/components/task/bulk-actions-bar";
import { TaskListView } from "@/components/task/list/task-list-view";
import { TaskFiltersPanel } from "@/components/task/task-filters-panel";
import { TaskPagination } from "@/components/task/task-pagination";
import { Button } from "@/components/ui/button";
import { common, savedFilters as savedFiltersText, tasks } from "@/constants";
import {
  useBulkDeleteTasks,
  useBulkUpdateTasks,
  useTasks,
} from "@/hooks/tasks";
import { ALL_FILTER_VALUE, useTaskFilters } from "@/hooks/use-task-filters";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/hooks/users";
import { filterTasks } from "@/lib/filter-utils";
import { TASK_STATUS_CONFIG, TASK_STATUS_ORDER } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store/app-context-store";
import { useSavedFilters } from "@/store/filters-store";
import { useOpenModal } from "@/store/modal-store";
import { TaskPriority, TaskStatus, TaskWithProject } from "@/types/tasks";

type TasksProps = {
  viewMode?: "tasks" | "issues";
};

export default function Tasks({ viewMode = "tasks" }: TasksProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const openModal = useOpenModal();
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

  const hasActiveFilters = !!(
    searchTerm ||
    selectedStatus !== "all" ||
    selectedPriority !== "all" ||
    selectedAssignee !== "all" ||
    selectedDateRange !== "all" ||
    selectedTag !== "all"
  );

  const currentFilterMatch = getCurrentFilterMatch(currentFilters);
  const hasAutoAppliedDefaultRef = useRef(false);

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

  const applyFilter = useCallback(
    async (
      filter: (typeof savedFiltersData)[0],
      options: { toastOnSuccess?: boolean } = {},
    ) => {
      const { toastOnSuccess = true } = options;
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

        if (toastOnSuccess) {
          toast({
            title: savedFiltersText.toast.applied,
          });
        }
      } catch {
        toast({
          title: savedFiltersText.toast.applyError,
          variant: "destructive",
        });
      }
    },
    [
      setSearchTerm,
      setSelectedStatus,
      setSelectedPriority,
      setSelectedAssignee,
      setSelectedDateRange,
      setSelectedTag,
      toast,
    ],
  );

  const handleApplyFilter = async (filter: (typeof savedFiltersData)[0]) => {
    await applyFilter(filter);
  };

  // Auto-apply default filter on first load of `/tasks` when there are no query params.
  useEffect(() => {
    if (hasAutoAppliedDefaultRef.current) return;
    if (location.search) return;
    if (!defaultFilterId) return;
    if (currentFilterMatch?.id === defaultFilterId) return;

    const defaultFilter = savedFiltersData.find(
      (filter) => filter.id === defaultFilterId,
    );

    if (!defaultFilter) return;
    if (hasActiveFilters) return;

    hasAutoAppliedDefaultRef.current = true;
    void applyFilter(defaultFilter, { toastOnSuccess: false });
  }, [
    applyFilter,
    currentFilterMatch?.id,
    defaultFilterId,
    hasActiveFilters,
    location.search,
    savedFiltersData,
  ]);

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
    // Multi-status ("a,b") and due/tag filters are applied client-side below
    status:
      selectedStatus === "all" || selectedStatus.includes(",")
        ? undefined
        : selectedStatus,
    priority: selectedPriority === "all" ? undefined : selectedPriority,
    tagId: selectedTag === "all" ? undefined : selectedTag,
    dueRange: selectedDateRange === "all" ? undefined : selectedDateRange,
    assigneeUserId:
      selectedAssignee === "all"
        ? undefined
        : selectedAssignee === "me"
          ? authUser?._id
          : selectedAssignee,
  });

  const filteredItems = useMemo(
    () =>
      taskQuery.data?.items
        ? (filterTasks(taskQuery.data.items, {
            ...currentFilters,
            searchTerm: "", // search is handled by the server index
          }) as TaskWithProject[])
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      taskQuery.data?.items,
      selectedStatus,
      selectedPriority,
      selectedAssignee,
      selectedDateRange,
      selectedTag,
    ],
  );
  const totalTasks = filteredItems?.length ?? 0;
  const totalPages = taskQuery.data?.totalPages ?? 1;

  const groupedTasks = useMemo(() => {
    const items = filteredItems;
    if (taskQuery.isPending || !items) {
      return {} as Record<TaskStatus, TaskWithProject[]>;
    }
    return items.reduce<Record<TaskStatus, TaskWithProject[]>>(
      (acc, task) => {
        const status = task.status as TaskStatus;
        const list = acc[status] ?? [];
        list.push(task);
        acc[status] = list;
        return acc;
      },
      {} as Record<TaskStatus, TaskWithProject[]>,
    );
  }, [filteredItems, taskQuery.isPending]);

  const handleBulkDelete = async () => {
    const count = await bulkDelete.mutate(selectedTasks);
    setSelectedTasks([]);
    setSelectionMode(false);
    return count;
  };

  const handleBulkAssign = async (assigneeId: string) => {
    const count = await bulkUpdate.mutate({
      ids: selectedTasks,
      updates: { assignee: assigneeId },
    });
    setSelectedTasks([]);
    return count;
  };

  const handleBulkStatus = async (status: TaskStatus) => {
    const count = await bulkUpdate.mutate({
      ids: selectedTasks,
      updates: { status },
    });
    setSelectedTasks([]);
    return count;
  };

  const handleBulkPriority = async (priority: TaskPriority) => {
    const count = await bulkUpdate.mutate({
      ids: selectedTasks,
      updates: { priority },
    });
    setSelectedTasks([]);
    return count;
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
    <PageTransition
      data-testid="tasks-page"
      className="container mx-auto max-w-7xl p-4 md:p-6"
    >
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
                className={cn("gap-2", "h-8 px-3 text-xs font-semibold")}
              >
                <LayoutGrid className="size-4" />
                <span>{tasks.board.title}</span>
              </Button>

              <ToolbarSeparator className="bg-border/40 mx-2 h-5 w-px" />

              <Button
                variant="ghost"
                data-testid="selection-mode-toggle"
                onClick={toggleSelectionMode}
                className={cn(
                  "gap-2",
                  "h-8 px-3 text-xs font-semibold",
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
              data-testid="new-task-button"
              className={cn(
                "gap-2 rounded-lg shadow-sm transition-all",
                "h-8 px-3 text-xs font-semibold",
              )}
              onClick={() => openModal("create-task")}
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

      <div className={cn("space-y-10", "space-y-4")} data-animate-stagger>
        <TaskListView
          isLoading={taskQuery.isPending}
          totalTasks={totalTasks}
          hasActiveFilters={hasActiveFilters}
          groupedTasks={groupedTasks}
          selectionMode={selectionMode}
          selectedTasks={selectedTasks}
          onSelectionChange={handleSelectionChange}
          statusOrder={TASK_STATUS_ORDER}
        />
      </div>

      {!taskQuery.isPending && totalTasks > 0 && (
        <div className={cn("border-border/20 border-t", "mt-6 pt-6")}>
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
              displayName: u.displayName || u.email || "",
            })) || []
          }
          availableStatuses={availableStatuses}
        />
      )}
    </PageTransition>
  );
}
