import { useState } from "react";

import { ManageSavedFiltersDialog } from "@/components/task/filters/manage-saved-filters-dialog";
import { SaveFilterDialog } from "@/components/task/filters/save-filter-dialog";
import { SavedFiltersDropdown } from "@/components/task/filters/saved-filters-dropdown";
import { TaskFilters } from "@/components/task/filters/task-filters";
import type {
  TaskFilterValues,
  UseTaskFiltersReturn,
} from "@/hooks/use-task-filters";
import type { FilterableTask } from "@/lib/filter-utils";
import type { SavedFilter } from "@/store/filters-store";

// User type with compatibility fields
interface UserWithCompat {
  _id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

type TaskFiltersPanelProps = {
  currentFilters: TaskFilterValues;
  savedFilters: SavedFilter[];
  currentFilterMatch: SavedFilter | null;
  defaultFilterId: string | null;
  disableSave: boolean;
  onSaveFilter: (name: string, setAsDefault: boolean) => void;
  onApplyFilter: (filter: SavedFilter) => void;
  onUpdateFilter: (
    id: string,
    updates: Partial<Omit<SavedFilter, "id" | "createdAt">>,
  ) => void;
  onDeleteFilter: (id: string) => void;
  onSetDefault: (id: string | null) => void;
  searchTerm: string;
  selectedStatus: string;
  selectedPriority: string;
  selectedAssignee: string;
  selectedDateRange: string;
  selectedTag: string;
  setSearchTerm: UseTaskFiltersReturn<FilterableTask>["setSearchTerm"];
  setSelectedStatus: UseTaskFiltersReturn<FilterableTask>["setSelectedStatus"];
  setSelectedPriority: UseTaskFiltersReturn<FilterableTask>["setSelectedPriority"];
  setSelectedAssignee: UseTaskFiltersReturn<FilterableTask>["setSelectedAssignee"];
  setSelectedDateRange: UseTaskFiltersReturn<FilterableTask>["setSelectedDateRange"];
  setSelectedTag: UseTaskFiltersReturn<FilterableTask>["setSelectedTag"];
  users: UserWithCompat[] | undefined;
  isLoadingUsers: boolean;
};

export function TaskFiltersPanel({
  currentFilters,
  savedFilters,
  currentFilterMatch,
  defaultFilterId,
  disableSave,
  onSaveFilter,
  onApplyFilter,
  onUpdateFilter,
  onDeleteFilter,
  onSetDefault,
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
}: TaskFiltersPanelProps) {
  const [saveFilterDialogOpen, setSaveFilterDialogOpen] = useState(false);
  const [manageFiltersDialogOpen, setManageFiltersDialogOpen] = useState(false);
  return (
    <div className="mb-4" data-animate-stagger>
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
        actions={
          <SavedFiltersDropdown
            savedFilters={savedFilters}
            currentFilterMatch={currentFilterMatch}
            defaultFilterId={defaultFilterId}
            onApplyFilter={onApplyFilter}
            onDeleteFilter={onDeleteFilter}
            onSetDefault={onSetDefault}
            onOpenSaveDialog={() => setSaveFilterDialogOpen(true)}
            onOpenManageDialog={() => setManageFiltersDialogOpen(true)}
            disableSave={disableSave}
          />
        }
      />

      <SaveFilterDialog
        open={saveFilterDialogOpen}
        onOpenChange={setSaveFilterDialogOpen}
        currentFilters={currentFilters}
        onSave={onSaveFilter}
      />

      <ManageSavedFiltersDialog
        open={manageFiltersDialogOpen}
        onOpenChange={setManageFiltersDialogOpen}
        savedFilters={savedFilters}
        defaultFilterId={defaultFilterId}
        onUpdateFilter={onUpdateFilter}
        onDeleteFilter={onDeleteFilter}
        onSetDefault={onSetDefault}
      />
    </div>
  );
}
