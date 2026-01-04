import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  formatISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
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
import type { TaskWithProject } from "@/lib/pocketbase";
import {
  type TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { TASK_STATUS_CONFIG, statusOrder } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store/auth-store";

type TasksProps = {
  viewMode?: "tasks" | "issues";
};

export default function Tasks({ viewMode = "tasks" }: TasksProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
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
      parts.push(`tags.id ?= "${selectedTag}"`);
    }

    return parts.join(" && ");
  }, [
    authUser,
    searchTerm,
    selectedAssignee,
    selectedDateRange,
    selectedPriority,
    selectedStatus,
    selectedTag,
  ]);

  // Reset pagination when filters change
  // This is a legitimate use of setState in effect for UI state synchronization
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (filterExpression) {
      setPage(1);
    }
  }, [filterExpression]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const { data: users, isPending: isLoadingUsers } = useUsers({
    batch: 100,
    sort: "-created",
  });

  const taskQuery = useTasks({
    expandFields: "project,assignee,tags",
    mode: "paged",
    page,
    perPage,
    filter: filterExpression || undefined,
  });

  const totalTasks = taskQuery.data?.totalItems ?? 0;
  const totalPages = taskQuery.data?.totalPages ?? 1;

  const groupedTasks = useMemo(() => {
    const items = taskQuery.data?.items;
    if (taskQuery.isPending || !items) {
      return {} as Record<TasksStatusOptions, TaskWithProject[]>;
    }
    return items.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      },
      {} as Record<TasksStatusOptions, TaskWithProject[]>,
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

  const handleBulkStatus = async (status: TasksStatusOptions) => {
    await bulkUpdate.mutateAsync({
      ids: selectedTasks,
      updates: { status },
    });
    setSelectedTasks([]);
  };

  const handleBulkPriority = async (priority: TasksPriorityOptions) => {
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

  const availableStatuses: Array<{ value: TasksStatusOptions; label: string }> =
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
                className="hover:bg-muted/50 h-10 gap-2 rounded-lg px-4 text-sm font-bold transition-all"
              >
                <LayoutGrid className="size-4" />
                <span>{tasks.board.title}</span>
              </Button>

              <ToolbarSeparator className="bg-border/40 mx-2 h-5 w-px" />

              <Button
                variant="ghost"
                onClick={toggleSelectionMode}
                className={cn(
                  "hover:bg-muted/50 h-10 gap-2 rounded-lg px-4 text-sm font-bold transition-all",
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
              className="h-10 gap-2 rounded-lg px-5 text-sm font-bold shadow-sm transition-all hover:scale-[1.02]"
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

      <div className="space-y-10" data-animate-stagger>
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
        <div className="border-border/20 mt-10 border-t pt-10">
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
          users={users || []}
          availableStatuses={availableStatuses}
        />
      )}
    </PageTransition>
  );
}
