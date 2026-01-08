import { Check, Edit2, Star, Trash2, X } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { common, savedFilters as savedFiltersText } from "@/constants";
import type { SavedFilter } from "@/store/filters-store";

interface ManageSavedFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedFilters: SavedFilter[];
  defaultFilterId: string | null;
  onUpdateFilter: (
    id: string,
    updates: Partial<Omit<SavedFilter, "id" | "createdAt">>,
  ) => void;
  onDeleteFilter: (id: string) => void;
  onSetDefault: (id: string | null) => void;
}

export function ManageSavedFiltersDialog({
  open,
  onOpenChange,
  savedFilters,
  defaultFilterId,
  onUpdateFilter,
  onDeleteFilter,
  onSetDefault,
}: ManageSavedFiltersDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterToDelete, setFilterToDelete] = useState<SavedFilter | null>(
    null,
  );

  const handleStartEdit = (filter: SavedFilter) => {
    setEditingId(filter.id);
    setEditName(filter.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateFilter(id, { name: editName.trim() });
    handleCancelEdit();
  };

  const handleDeleteClick = (filter: SavedFilter) => {
    setFilterToDelete(filter);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (filterToDelete) {
      onDeleteFilter(filterToDelete.id);
      setFilterToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleToggleDefault = (filterId: string) => {
    onSetDefault(defaultFilterId === filterId ? null : filterId);
  };

  const getFilterSummary = (filter: SavedFilter) => {
    const active: string[] = [];
    if (filter.filters.searchTerm)
      active.push(savedFiltersText.criteria.search);
    if (filter.filters.selectedStatus !== "all")
      active.push(savedFiltersText.criteria.status);
    if (filter.filters.selectedPriority !== "all")
      active.push(savedFiltersText.criteria.priority);
    if (filter.filters.selectedAssignee !== "all")
      active.push(savedFiltersText.criteria.assignee);
    if (filter.filters.selectedDateRange !== "all")
      active.push(savedFiltersText.criteria.date);
    if (filter.filters.selectedTag !== "all")
      active.push(savedFiltersText.criteria.tag);

    return active.length > 0
      ? active.join(" • ")
      : savedFiltersText.criteria.noFilter;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{savedFiltersText.manageDialog.title}</DialogTitle>
            <DialogDescription>
              {savedFiltersText.manageDialog.description}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-3 overflow-y-auto py-4">
            {savedFilters.length === 0 ? (
              <div className="text-muted-foreground py-12 text-center">
                {savedFiltersText.noSavedFilters}
              </div>
            ) : (
              savedFilters.map((filter) => (
                <Card key={filter.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Filter name */}
                        {editingId === filter.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveEdit(filter.id);
                                } else if (e.key === "Escape") {
                                  handleCancelEdit();
                                }
                              }}
                              className="h-8"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveEdit(filter.id)}
                              disabled={!editName.trim()}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{filter.name}</h3>
                            {defaultFilterId === filter.id && (
                              <Badge
                                variant="secondary"
                                className="gap-1 text-xs"
                              >
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {savedFiltersText.default}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Filter summary */}
                        <p className="text-muted-foreground text-sm">
                          {getFilterSummary(filter)}
                        </p>

                        {/* Created date */}
                        <p className="text-muted-foreground text-xs">
                          {savedFiltersText.createdAt}:{" "}
                          {new Date(filter.createdAt).toLocaleDateString(
                            "fa-IR",
                          )}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleDefault(filter.id)}
                          title={
                            defaultFilterId === filter.id
                              ? savedFiltersText.removeDefault
                              : savedFiltersText.setAsDefault
                          }
                        >
                          <Star
                            className={`h-4 w-4 ${
                              defaultFilterId === filter.id
                                ? "fill-yellow-400 text-yellow-400"
                                : ""
                            }`}
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(filter)}
                          disabled={editingId !== null}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(filter)}
                        >
                          <Trash2 className="text-destructive h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {savedFiltersText.deleteDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {savedFiltersText.deleteDialog.description.replace(
                "{name}",
                filterToDelete?.name || "",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
