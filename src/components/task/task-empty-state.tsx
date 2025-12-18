import { FilterX, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fa } from "@/constants";

type TaskEmptyStateProps = {
  hasFilters: boolean;
};

export function TaskEmptyState({ hasFilters }: TaskEmptyStateProps) {
  const navigate = useNavigate();

  if (hasFilters) {
    return (
      <Card className="border-dashed">
        <CardContent
          className="flex flex-col items-center justify-center py-12 text-center"
          data-animate-stagger
        >
          <FilterX className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">
            {fa.tasks.emptyState.noTasksFound}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {fa.tasks.emptyState.noTasksFoundDescription}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent
        className="flex flex-col items-center justify-center py-12 text-center"
        data-animate-stagger
      >
        <div
          className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          data-interactive-pulse
        >
          <Plus className="text-primary h-6 w-6" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">
          {fa.tasks.emptyState.noTasksYet}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {fa.tasks.emptyState.noTasksYetDescription}
        </p>
        <Button className="gap-2" onClick={() => navigate("/tasks/new")}>
          <Plus className="h-4 w-4" />
          {fa.tasks.emptyState.createFirstTask}
        </Button>
      </CardContent>
    </Card>
  );
}
