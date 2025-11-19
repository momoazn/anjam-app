import { useState } from "react";
import { toast } from "sonner";
import { X, Trash2, Users, Flag, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { text } from "@/constants/text";
import type {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => Promise<void>;
  onBulkAssign: (assigneeId: string) => Promise<void>;
  onBulkStatus: (status: TasksStatusOptions) => Promise<void>;
  onBulkPriority: (priority: TasksPriorityOptions) => Promise<void>;
  users: Array<{
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
  }>;
  availableStatuses: Array<{ value: TasksStatusOptions; label: string }>;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkAssign,
  onBulkStatus,
  onBulkPriority,
  users,
  availableStatuses,
}: BulkActionsBarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBulkAssign = async (userId: string) => {
    try {
      setIsLoading(true);
      await onBulkAssign(userId);
      toast.success(
        text.tasks.bulkActions.assignSuccess.replace(
          "{count}",
          String(selectedCount),
        ),
      );
    } catch (error) {
      toast.error(text.tasks.bulkActions.assignError);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkStatus = async (status: TasksStatusOptions) => {
    try {
      setIsLoading(true);
      await onBulkStatus(status);
      toast.success(
        text.tasks.bulkActions.statusSuccess.replace(
          "{count}",
          String(selectedCount),
        ),
      );
    } catch (error) {
      toast.error(text.tasks.bulkActions.statusError);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkPriority = async (priority: TasksPriorityOptions) => {
    try {
      setIsLoading(true);
      await onBulkPriority(priority);
      toast.success(
        text.tasks.bulkActions.prioritySuccess.replace(
          "{count}",
          String(selectedCount),
        ),
      );
    } catch (error) {
      toast.error(text.tasks.bulkActions.priorityError);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await onBulkDelete();
      toast.success(
        text.tasks.bulkActions.deleteSuccess.replace(
          "{count}",
          String(selectedCount),
        ),
      );
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error(text.tasks.bulkActions.deleteError);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const priorityOptions: Array<{ value: TasksPriorityOptions; label: string }> =
    [
      { value: "low", label: text.tasks.priority.low },
      { value: "medium", label: text.tasks.priority.medium },
      { value: "high", label: text.tasks.priority.high },
      { value: "urgent", label: text.tasks.priority.urgent },
    ];

  return (
    <>
      <div className="border-border bg-card fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {text.tasks.bulkActions.selectedCount.replace(
              "{count}",
              String(selectedCount),
            )}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-border h-6 w-px" />

        {/* Bulk Assign */}
        <Select onValueChange={handleBulkAssign} disabled={isLoading}>
          <SelectTrigger className="w-[180px]">
            <Users className="mr-2 h-4 w-4" />
            <SelectValue
              placeholder={text.tasks.bulkActions.assignPlaceholder}
            />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.first_name || user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bulk Status Change */}
        <Select onValueChange={handleBulkStatus} disabled={isLoading}>
          <SelectTrigger className="w-[160px]">
            <RefreshCw className="mr-2 h-4 w-4" />
            <SelectValue
              placeholder={text.tasks.bulkActions.statusPlaceholder}
            />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bulk Priority Change */}
        <Select onValueChange={handleBulkPriority} disabled={isLoading}>
          <SelectTrigger className="w-[150px]">
            <Flag className="mr-2 h-4 w-4" />
            <SelectValue
              placeholder={text.tasks.bulkActions.priorityPlaceholder}
            />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="bg-border h-6 w-px" />

        {/* Bulk Delete */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isLoading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {text.tasks.bulkActions.deleteButton}
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {text.tasks.bulkActions.deleteDialogTitle.replace(
                "{count}",
                String(selectedCount),
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {text.tasks.bulkActions.deleteDialogDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              {text.tasks.bulkActions.cancelButton}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading
                ? text.tasks.bulkActions.deletingButton
                : text.tasks.bulkActions.deleteButton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
