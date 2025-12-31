import { Layers } from "lucide-react";
import { useState } from "react";

import { ManageSavedFiltersDialog } from "@/components/task/manage-saved-filters-dialog";
import { SaveFilterDialog } from "@/components/task/save-filter-dialog";
import { SavedFiltersDropdown } from "@/components/task/saved-filters-dropdown";
import { TaskFilters } from "@/components/task/task-filters";
import { Card, CardContent } from "@/components/ui/card";
import { tasks } from "@/constants";
import type { SavedFilter } from "@/hooks/use-saved-filters";
import type {
  TaskFilterValues,
  UseTaskFiltersReturn,
} from "@/hooks/use-task-filters";
import type { UsersResponse } from "@/lib/pocketbase-types";

export type TaskFiltersPanelProps = {
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
  setSearchTerm: UseTaskFiltersReturn["setSearchTerm"];
  setSelectedStatus: UseTaskFiltersReturn["setSelectedStatus"];
  setSelectedPriority: UseTaskFiltersReturn["setSelectedPriority"];
  setSelectedAssignee: UseTaskFiltersReturn["setSelectedAssignee"];
  setSelectedDateRange: UseTaskFiltersReturn["setSelectedDateRange"];
  setSelectedTag: UseTaskFiltersReturn["setSelectedTag"];
  users: UsersResponse[] | undefined;
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
    <div className="mb-10 space-y-6" data-animate-stagger>
      <div className="border-border/20 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <Layers className="text-primary/60 size-3.5" />
          <span className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
            {tasks.filters.labels.filterLogic}
          </span>
        </div>

        <SavedFiltersDropdown
          savedFilters={savedFilters}
          currentFilterMatch={currentFilterMatch}
          defaultFilterId={defaultFilterId}
          onApplyFilter={onApplyFilter}
          onDeleteFilter={onDeleteFilter}
          onSetDefault={onSetDefault}
          onOpenSaveDialog={() => setSaveFilterDialogOpen(true)}
          onOpenManageDialog={() => setManageFiltersDialogOpen(true)}
          disabled={disableSave}
        />
      </div>

      <Card className="border-border/40 rounded-2xl">
        <CardContent className="p-6">
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
        </CardContent>
      </Card>

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
