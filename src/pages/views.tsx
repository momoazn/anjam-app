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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { savedFilters as savedFiltersConstants, shared } from "@/constants";
import { useSavedFilters } from "@/hooks/use-saved-filters";
import { getModeLabels } from "@/lib/mode";
import { useCurrentOrgMode } from "@/store/auth-store";

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
  const mode = useCurrentOrgMode();
  const labels = getModeLabels(mode);
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
        title={labels.savedFilters}
        subtitle={
          mode === "product"
            ? savedFiltersConstants.views.description
            : savedFiltersConstants.views.manageDescription
        }
        icon={IconEye}
      />

      {/* Views List */}
      {savedFilters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconEye className="text-muted-foreground mb-4 h-12 w-12 opacity-40" />
            <p className="text-muted-foreground text-center">
              {mode === "product"
                ? savedFiltersConstants.views.noViews
                : savedFiltersConstants.views.noFilters}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() =>
                navigate(mode === "product" ? "/issues" : "/tasks")
              }
            >
              {mode === "product"
                ? savedFiltersConstants.views.goToIssues
                : savedFiltersConstants.views.goToTasks}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedFilters.map((filter) => {
            const isDefault = filter.id === defaultFilterId;
            return (
              <Card
                key={filter.id}
                className="group cursor-pointer transition-all hover:shadow-md"
                onClick={() => handleNavigateToView(filter.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="truncate">{filter.name}</span>
                    {isDefault && (
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                        {savedFiltersConstants.views.default}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground mb-4 text-xs">
                    {savedFiltersConstants.createdAt}{" "}
                    {new Date(filter.createdAt).toLocaleDateString("fa-IR")}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
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
                        <IconStarFilled className="text-warning h-4 w-4" />
                      ) : (
                        <IconStar className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(filter.id);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
