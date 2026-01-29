import { useCallback } from "react";

import { useBulkDeleteTasks, useBulkUpdateTasks } from "@/hooks/tasks";
import { useToast } from "@/hooks/use-toast";
import { TaskPriority, TaskStatus } from "@/types/tasks";

export function useBulkActions() {
  const bulkUpdate = useBulkUpdateTasks();
  const bulkDelete = useBulkDeleteTasks();
  const { toast } = useToast();

  const handleBulkDelete = useCallback(
    async (selectedTasks: string[], onSuccess?: () => void) => {
      try {
        await bulkDelete.mutate(selectedTasks);
        onSuccess?.();
        toast({ title: "Tasks deleted successfully" });
      } catch {
        toast({ title: "Failed to delete tasks", variant: "destructive" });
      }
    },
    [bulkDelete, toast],
  );

  const handleBulkAssign = useCallback(
    async (
      selectedTasks: string[],
      assigneeId: string,
      onSuccess?: () => void,
    ) => {
      try {
        await bulkUpdate.mutate({
          ids: selectedTasks,
          updates: { assignee: assigneeId },
        });
        onSuccess?.();
        toast({ title: "Tasks assigned successfully" });
      } catch {
        toast({ title: "Failed to assign tasks", variant: "destructive" });
      }
    },
    [bulkUpdate, toast],
  );

  const handleBulkStatus = useCallback(
    async (
      selectedTasks: string[],
      status: TaskStatus,
      onSuccess?: () => void,
    ) => {
      try {
        await bulkUpdate.mutate({
          ids: selectedTasks,
          updates: { status },
        });
        onSuccess?.();
        toast({ title: "Status updated successfully" });
      } catch {
        toast({ title: "Failed to update status", variant: "destructive" });
      }
    },
    [bulkUpdate, toast],
  );

  const handleBulkPriority = useCallback(
    async (
      selectedTasks: string[],
      priority: TaskPriority,
      onSuccess?: () => void,
    ) => {
      try {
        await bulkUpdate.mutate({
          ids: selectedTasks,
          updates: { priority },
        });
        onSuccess?.();
        toast({ title: "Priority updated successfully" });
      } catch {
        toast({ title: "Failed to update priority", variant: "destructive" });
      }
    },
    [bulkUpdate, toast],
  );

  return {
    handleBulkDelete,
    handleBulkAssign,
    handleBulkStatus,
    handleBulkPriority,
    isPending: bulkUpdate.isPending || bulkDelete.isPending,
  };
}
