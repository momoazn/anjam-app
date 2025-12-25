import { useNavigate } from "react-router-dom";

import {
  EmptyStateNoResults,
  EmptyStateNoTasks,
} from "@/components/ui/empty-state";

type TaskEmptyStateProps = {
  hasFilters: boolean;
};

export function TaskEmptyState({ hasFilters }: TaskEmptyStateProps) {
  const navigate = useNavigate();

  if (hasFilters) {
    return <EmptyStateNoResults />;
  }

  return <EmptyStateNoTasks onCreate={() => navigate("/tasks/new")} />;
}
