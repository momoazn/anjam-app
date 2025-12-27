/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  formatISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { BulkActionsBar } from "@/components/task/bulk-actions-bar";
import { TaskFiltersPanel } from "@/components/task/task-filters-panel";
import { TaskHeader } from "@/components/task/task-header";
import { TaskListView } from "@/components/task/task-list-view";
import { TaskPagination } from "@/components/task/task-pagination";
import { PageTransition } from "@/components/page-transition";
import { savedFilters as savedFiltersText } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { ALL_FILTER_VALUE, useTaskFilters } from "@/hooks/use-task-filters";
import { useSavedFilters } from "@/hooks/use-saved-filters";
import {
  useBulkDeleteTasks,
  useBulkUpdateTasks,
  useTasks,
} from "@/hooks/tasks";
import { useUsers } from "@/hooks/users";
import type { TaskWithProject } from "@/lib/pocketbase";
import {
  TasksStatusOptions,
  type TasksPriorityOptions,
} from "@/lib/pocketbase-types";
import { statusOrder, TASK_STATUS_CONFIG } from "@/lib/status-utils";
import { useAuthUser } from "@/store/auth-store";

export default function Tasks() {
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

  useEffect(() => {
    if (filterExpression) {
      setPage(1);
    }
  }, [filterExpression]);

  const { data: users, isPending: isLoadingUsers } = useUsers({
    batch: 100,
    sort: "-created",
  });

  const taskQuery = useTasks({
    expandFields: "project,assignee",
    mode: "paged",
    page,
    perPage,
    filter: filterExpression || undefined,
  });

  const totalTasks = taskQuery.data?.totalItems ?? 0;
  const totalPages = taskQuery.data?.totalPages ?? 1;
  const currentPage = taskQuery.data?.page ?? page;
  const currentPerPage = taskQuery.data?.perPage ?? perPage;

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

  const pageStart =
    totalTasks === 0 ? 0 : (currentPage - 1) * currentPerPage + 1;
  const pageEnd =
    totalTasks === 0 ? 0 : Math.min(currentPage * currentPerPage, totalTasks);

  const availableStatuses: Array<{ value: TasksStatusOptions; label: string }> =
    Object.values(TASK_STATUS_CONFIG).map((config) => ({
      value: config.key,
      label: config.name,
    }));

  return (
    <PageTransition className="container mx-auto p-4 md:p-[var(--ds-spacing-cardPadding)]">
      <TaskHeader
        totalTasks={totalTasks}
        selectionMode={selectionMode}
        onToggleSelection={toggleSelectionMode}
        onNavigateBoard={() => navigate("/tasks/board")}
        onCreateTask={() => navigate("/tasks/new")}
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
            currentPage={currentPage}
            totalPages={totalPages}
            currentPerPage={currentPerPage}
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
