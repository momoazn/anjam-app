import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookmarkIcon,
  Star,
  Settings,
  Trash2,
  Check,
  Save,
} from "lucide-react";
import { text } from "@/constants/text";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import type { SavedFilter } from "@/hooks/use-saved-filters";
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

interface SavedFiltersDropdownProps {
  savedFilters: SavedFilter[];
  currentFilterMatch: SavedFilter | null;
  defaultFilterId: string | null;
  onApplyFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (id: string) => void;
  onSetDefault: (id: string | null) => void;
  onOpenSaveDialog: () => void;
  onOpenManageDialog: () => void;
  disabled?: boolean;
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
  disabled,
}: SavedFiltersDropdownProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterToDelete, setFilterToDelete] = useState<SavedFilter | null>(
    null,
  );

  const handleDeleteClick = (filter: SavedFilter, e: React.MouseEvent) => {
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

  const handleSetDefault = (filterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle default: if already default, clear it
    onSetDefault(defaultFilterId === filterId ? null : filterId);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2" disabled={disabled}>
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
                {text.savedFilters.title}
                {savedFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {digitsEnToFa(savedFilters.length)}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>{text.savedFilters.title}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Save current filter option */}
          <DropdownMenuItem onClick={onOpenSaveDialog} className="gap-2">
            <Save className="h-4 w-4" />
            {text.savedFilters.saveCurrentFilter}
          </DropdownMenuItem>

          {savedFilters.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
                {text.savedFilters.myFilters}
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
                    <button
                      onClick={(e) => handleSetDefault(filter.id, e)}
                      className="hover:bg-accent rounded p-1 transition-colors"
                      title={
                        defaultFilterId === filter.id
                          ? text.savedFilters.removeDefault
                          : text.savedFilters.setAsDefault
                      }
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          defaultFilterId === filter.id
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(filter, e)}
                      className="hover:bg-destructive/10 rounded p-1 transition-colors"
                      title={text.common.delete}
                    >
                      <Trash2 className="text-muted-foreground hover:text-destructive h-3.5 w-3.5" />
                    </button>
                  </div>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenManageDialog} className="gap-2">
                <Settings className="h-4 w-4" />
                {text.savedFilters.manage}
              </DropdownMenuItem>
            </>
          )}

          {savedFilters.length === 0 && (
            <div className="text-muted-foreground px-2 py-6 text-center text-sm">
              {text.savedFilters.noSavedFilters}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {text.savedFilters.deleteDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {text.savedFilters.deleteDialog.description.replace(
                "{name}",
                filterToDelete?.name || "",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{text.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              {text.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
