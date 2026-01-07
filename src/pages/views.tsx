import {
  IconEye,
  IconStar,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { savedFilters as savedFiltersConstants, shared } from "@/constants";
import { useSavedFilters } from "@/hooks/use-saved-filters";
import { cn } from "@/lib/utils";

/**
 * Views Page - Manage Saved Filters
 *
 * Displays all saved task filters (views) with options to:
 * - Navigate to a view
 * - Set a view as default
 * - Delete a view
 *
 * Product mode terminology: "Views"
 * Operations mode terminology: "Saved Filters"
 */
export default function Views() {
  const navigate = useNavigate();
  const { savedFilters, deleteFilter, setAsDefault, defaultFilterId } =
    useSavedFilters();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleNavigateToView = (filterId: string) => {
    const filter = savedFilters.find((f) => f.id === filterId);
    if (!filter) return;

    // Build query string from filter values
    const params = new URLSearchParams();
    if (filter.filters.searchTerm)
      params.set("search", filter.filters.searchTerm);
    if (filter.filters.selectedStatus !== "all")
      params.set("status", filter.filters.selectedStatus);
    if (filter.filters.selectedPriority !== "all")
      params.set("priority", filter.filters.selectedPriority);
    if (filter.filters.selectedAssignee !== "all")
      params.set("assignee", filter.filters.selectedAssignee);
    if (filter.filters.selectedDateRange !== "all")
      params.set("due", filter.filters.selectedDateRange);
    if (filter.filters.selectedTag !== "all")
      params.set("tag", filter.filters.selectedTag);

    const queryString = params.toString();
    navigate(queryString ? `/tasks?${queryString}` : "/tasks");
  };

  const handleSetDefault = (filterId: string) => {
    if (defaultFilterId === filterId) {
      setAsDefault(null);
      toast.success(savedFiltersConstants.views.toast.defaultCleared);
    } else {
      setAsDefault(filterId);
      toast.success(savedFiltersConstants.views.toast.defaultSet);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteFilter(deleteTarget);
      toast.success(savedFiltersConstants.views.toast.deleted);
      setDeleteTarget(null);
    }
  };

  return (
    <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
      <PageHeader
        title={savedFiltersConstants.views.title}
        subtitle={savedFiltersConstants.views.description}
        icon={IconEye}
      />

      {/* Views List */}
      {savedFilters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconEye className="text-muted-foreground mb-4 h-12 w-12 opacity-40" />
            <p className="text-muted-foreground text-center">
              {savedFiltersConstants.views.noViews}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/issues")}
            >
              {savedFiltersConstants.views.goToIssues}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30">
          {savedFilters.map((filter) => {
            const isDefault = filter.id === defaultFilterId;
            return (
              <div
                key={filter.id}
                className="group border-b border-border/40 last:border-b-0"
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="flex h-auto w-full items-center justify-between gap-3 rounded-none px-3 py-3 text-right hover:bg-muted/30"
                  onClick={() => handleNavigateToView(filter.id)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">
                        {filter.name}
                      </span>
                      {isDefault ? (
                        <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-[10px] font-semibold">
                          {savedFiltersConstants.views.default}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-muted-foreground mt-1 text-[10px] font-semibold tabular-nums">
                      {savedFiltersConstants.createdAt}{" "}
                      {new Date(filter.createdAt).toLocaleDateString("fa-IR")}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "size-8 rounded-lg",
                        isDefault && "text-warning",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(filter.id);
                      }}
                      title={
                        isDefault
                          ? savedFiltersConstants.views.clearDefault
                          : savedFiltersConstants.views.setDefault
                      }
                    >
                      {isDefault ? (
                        <IconStarFilled className="h-4 w-4" />
                      ) : (
                        <IconStar className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive size-8 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(filter.id);
                      }}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {savedFiltersConstants.views.deleteTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {savedFiltersConstants.views.deleteDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{shared.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              {shared.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
