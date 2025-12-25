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
import { common, savedFilters } from "@/constants";
interface SaveFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: {
    searchTerm: string;
    selectedStatus: string;
    selectedPriority: string;
    selectedAssignee: string;
    selectedDateRange: string;
    selectedTag: string;
  };
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

  const getFilterSummary = () => {
    const active: string[] = [];
    if (currentFilters.searchTerm)
      active.push(
        `${savedFilters.criteria.search}: ${currentFilters.searchTerm}`,
      );
    if (
      currentFilters.selectedStatus &&
      currentFilters.selectedStatus !== "all"
    )
      active.push(savedFilters.criteria.status);
    if (
      currentFilters.selectedPriority &&
      currentFilters.selectedPriority !== "all"
    )
      active.push(savedFilters.criteria.priority);
    if (
      currentFilters.selectedAssignee &&
      currentFilters.selectedAssignee !== "all"
    )
      active.push(savedFilters.criteria.assignee);
    if (currentFilters.selectedDateRange !== "all")
      active.push(savedFilters.criteria.date);
    if (currentFilters.selectedTag !== "all")
      active.push(savedFilters.criteria.tag);

    return active.length > 0
      ? active.join(" • ")
      : savedFilters.noActiveFilters;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{savedFilters.saveDialog.title}</DialogTitle>
          <DialogDescription>
            {savedFilters.saveDialog.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Filter summary */}
          <div className="bg-muted rounded-none p-3">
            <p className="text-muted-foreground mb-1 text-xs">
              {savedFilters.activeFilters}
            </p>
            <p className="text-sm">{getFilterSummary()}</p>
          </div>

          {/* Filter name input */}
          <div className="space-y-2">
            <Label htmlFor="filter-name">
              {savedFilters.saveDialog.nameLabel}
            </Label>
            <Input
              id="filter-name"
              placeholder={savedFilters.saveDialog.namePlaceholder}
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
              {savedFilters.saveDialog.setAsDefault}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {common.cancel}
          </Button>
          <Button onClick={handleSave} disabled={!filterName.trim()}>
            {common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
