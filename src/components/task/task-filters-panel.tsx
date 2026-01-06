import { Layers } from "lucide-react";
import { useState } from "react";

import { ManageSavedFiltersDialog } from "@/components/task/manage-saved-filters-dialog";
import { SaveFilterDialog } from "@/components/task/save-filter-dialog";
import { SavedFiltersDropdown } from "@/components/task/saved-filters-dropdown";
import { TaskFilters } from "@/components/task/task-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { tasks } from "@/constants";
import type { SavedFilter } from "@/hooks/use-saved-filters";
import type {
  TaskFilterValues,
  UseTaskFiltersReturn,
} from "@/hooks/use-task-filters";
import { cn } from "@/lib/utils";
import { useCurrentOrgMode } from "@/store/auth-store";

// User type with compatibility fields
interface UserWithCompat {
  id: string;
  _id: string;
  username?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
}

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
  setSearchTerm: UseTaskFiltersReturn<any>["setSearchTerm"];
  setSelectedStatus: UseTaskFiltersReturn<any>["setSelectedStatus"];
  setSelectedPriority: UseTaskFiltersReturn<any>["setSelectedPriority"];
  setSelectedAssignee: UseTaskFiltersReturn<any>["setSelectedAssignee"];
  setSelectedDateRange: UseTaskFiltersReturn<any>["setSelectedDateRange"];
  setSelectedTag: UseTaskFiltersReturn<any>["setSelectedTag"];
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
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
  const [saveFilterDialogOpen, setSaveFilterDialogOpen] = useState(false);
  const [manageFiltersDialogOpen, setManageFiltersDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(!isProductMode);

  return (
    <div
      className={cn("space-y-5", isProductMode ? "mb-4" : "mb-8")}
      data-animate-stagger
    >
      <div
        className={cn(
          "flex items-center justify-between",
          isProductMode ? "mb-3" : "border-border/20 border-b pb-3.5",
        )}
      >
        {isProductMode ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-lg px-3 text-xs font-semibold"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            {filtersOpen ? "بستن فیلترها" : "فیلترها"}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Layers className="text-primary/60 size-3.5" />
            <span className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
              {tasks.filters.labels.filterLogic}
            </span>
          </div>
        )}

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

      {filtersOpen ? (
        isProductMode ? (
          <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30">
            <div className="p-4">
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
          </div>
        ) : (
          <Card className="border-border/40 rounded-xl">
            <CardContent className="p-5">
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
        )
      ) : null}

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
