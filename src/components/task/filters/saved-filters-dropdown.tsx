import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  BookmarkIcon,
  Check,
  Save,
  Settings,
  Star,
  Trash2,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { common, savedFilters as savedFiltersText } from "@/constants";
import type { SavedFilter } from "@/store/filters-store";

interface SavedFiltersDropdownProps {
  savedFilters: SavedFilter[];
  currentFilterMatch: SavedFilter | null;
  defaultFilterId: string | null;
  onApplyFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (id: string) => void;
  onSetDefault: (id: string | null) => void;
  onOpenSaveDialog: () => void;
  onOpenManageDialog: () => void;
  disableSave?: boolean;
}

export function SavedFiltersDropdown({
  savedFilters,
  currentFilterMatch,
  defaultFilterId,
  onApplyFilter,
  onDeleteFilter,
  onSetDefault,
  onOpenSaveDialog,
  onOpenManageDialog,
  disableSave = false,
}: SavedFiltersDropdownProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterToDelete, setFilterToDelete] = useState<SavedFilter | null>(
    null,
  );

  const handleDeleteClick = (filter: SavedFilter, e: React.SyntheticEvent) => {
    e.stopPropagation();
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

  const handleSetDefault = (filterId: string, e: React.SyntheticEvent) => {
    e.stopPropagation();
    // Toggle default: if already default, clear it
    onSetDefault(defaultFilterId === filterId ? null : filterId);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <BookmarkIcon className="h-4 w-4" />
            {currentFilterMatch ? (
              <>
                {currentFilterMatch.name}
                {defaultFilterId === currentFilterMatch.id && (
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                )}
              </>
            ) : (
              <>
                {savedFiltersText.title}
                {savedFilters.length > 0 && (
                  <Badge variant="secondary" className="ms-1 h-5 px-1.5">
                    {digitsEnToFa(savedFilters.length)}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>{savedFiltersText.title}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Save current filter option */}
          <DropdownMenuItem
            onClick={onOpenSaveDialog}
            className="gap-2"
            disabled={disableSave}
          >
            <Save className="h-4 w-4" />
            {savedFiltersText.saveCurrentFilter}
          </DropdownMenuItem>

          {savedFilters.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
                {savedFiltersText.myFilters}
              </DropdownMenuLabel>

              {savedFilters.map((filter) => (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => onApplyFilter(filter)}
                  className="group flex items-center justify-between gap-2"
                >
                  <div className="flex flex-1 items-center gap-2">
                    <span className="flex-1 truncate">{filter.name}</span>
                    {currentFilterMatch?.id === filter.id && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleSetDefault(filter.id, e)}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleSetDefault(filter.id, e);
                        }
                      }}
                      className="hover:bg-accent cursor-pointer rounded p-1 transition-colors"
                      title={
                        defaultFilterId === filter.id
                          ? savedFiltersText.removeDefault
                          : savedFiltersText.setAsDefault
                      }
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          defaultFilterId === filter.id
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleDeleteClick(filter, e)}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleDeleteClick(filter, e);
                        }
                      }}
                      className="hover:bg-destructive/10 cursor-pointer rounded p-1 transition-colors"
                      title={common.delete}
                    >
                      <Trash2 className="text-muted-foreground hover:text-destructive h-3.5 w-3.5" />
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenManageDialog} className="gap-2">
                <Settings className="h-4 w-4" />
                {savedFiltersText.manage}
              </DropdownMenuItem>
            </>
          )}

          {savedFilters.length === 0 && (
            <div className="text-muted-foreground px-2 py-6 text-center text-sm">
              {savedFiltersText.noSavedFilters}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
            <AlertDialogAction onClick={handleConfirmDelete}>
              {common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
