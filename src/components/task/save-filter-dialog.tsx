import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { text } from "@/constants/text";
import type { TaskFiltersState } from "@/hooks/use-task-filters";

interface SaveFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: TaskFiltersState;
  onSave: (name: string, setAsDefault: boolean) => void;
}

export function SaveFilterDialog({
  open,
  onOpenChange,
  currentFilters,
  onSave,
}: SaveFilterDialogProps) {
  const [filterName, setFilterName] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);

  const handleSave = () => {
    if (!filterName.trim()) return;

    onSave(filterName.trim(), setAsDefault);
    setFilterName("");
    setSetAsDefault(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFilterName("");
    setSetAsDefault(false);
    onOpenChange(false);
  };

  // Get active filter summary
  const getFilterSummary = () => {
    const active: string[] = [];
    if (currentFilters.searchTerm)
      active.push(
        `${text.savedFilters.criteria.search}: ${currentFilters.searchTerm}`,
      );
    if (
      currentFilters.selectedStatus &&
      currentFilters.selectedStatus !== "all"
    )
      active.push(text.savedFilters.criteria.status);
    if (
      currentFilters.selectedPriority &&
      currentFilters.selectedPriority !== "all"
    )
      active.push(text.savedFilters.criteria.priority);
    if (
      currentFilters.selectedAssignee &&
      currentFilters.selectedAssignee !== "all"
    )
      active.push(text.savedFilters.criteria.assignee);
    if (currentFilters.selectedDateRange !== "all")
      active.push(text.savedFilters.criteria.date);
    if (currentFilters.selectedTag !== "all")
      active.push(text.savedFilters.criteria.tag);

    return active.length > 0
      ? active.join(" • ")
      : text.savedFilters.noActiveFilters;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{text.savedFilters.saveDialog.title}</DialogTitle>
          <DialogDescription>
            {text.savedFilters.saveDialog.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Filter summary */}
          <div className="bg-muted rounded-md p-3">
            <p className="text-muted-foreground mb-1 text-xs">
              {text.savedFilters.activeFilters}
            </p>
            <p className="text-sm">{getFilterSummary()}</p>
          </div>

          {/* Filter name input */}
          <div className="space-y-2">
            <Label htmlFor="filter-name">
              {text.savedFilters.saveDialog.nameLabel}
            </Label>
            <Input
              id="filter-name"
              placeholder={text.savedFilters.saveDialog.namePlaceholder}
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>

          {/* Set as default checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="set-default"
              checked={setAsDefault}
              onCheckedChange={(checked) => setSetAsDefault(!!checked)}
            />
            <Label
              htmlFor="set-default"
              className="cursor-pointer text-sm font-normal"
            >
              {text.savedFilters.saveDialog.setAsDefault}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {text.common.cancel}
          </Button>
          <Button onClick={handleSave} disabled={!filterName.trim()}>
            {text.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
