import { digitsEnToFa } from "@persian-tools/persian-tools";
import { Flag, RefreshCw, Terminal, Trash2, Users, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { common, tasks } from "@/constants";
import {
  TasksPriorityOptions,
  type TasksStatusOptions,
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
        tasks.bulkActions.assignSuccess.replace(
          "{count}",
          digitsEnToFa(selectedCount),
        ),
      );
    } catch {
      toast.error(tasks.bulkActions.assignError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkStatus = async (status: TasksStatusOptions) => {
    try {
      setIsLoading(true);
      await onBulkStatus(status);
      toast.success(
        tasks.bulkActions.statusSuccess.replace(
          "{count}",
          digitsEnToFa(selectedCount),
        ),
      );
    } catch {
      toast.error(tasks.bulkActions.statusError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkPriority = async (priority: TasksPriorityOptions) => {
    try {
      setIsLoading(true);
      await onBulkPriority(priority);
      toast.success(
        tasks.bulkActions.prioritySuccess.replace(
          "{count}",
          String(selectedCount),
        ),
      );
    } catch {
      toast.error(tasks.bulkActions.priorityError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await onBulkDelete();
      toast.success(
        tasks.bulkActions.deleteSuccess.replace(
          "{count}",
          digitsEnToFa(selectedCount),
        ),
      );
      setShowDeleteDialog(false);
    } catch {
      toast.error(tasks.bulkActions.deleteError);
    } finally {
      setIsLoading(false);
    }
  };

  const priorityOptions: Array<{ value: TasksPriorityOptions; label: string }> =
    [
      { value: TasksPriorityOptions.low, label: tasks.priority.low },
      {
        value: TasksPriorityOptions.medium,
        label: tasks.priority.medium,
      },
      { value: TasksPriorityOptions.high, label: tasks.priority.high },
      {
        value: TasksPriorityOptions.urgent,
        label: tasks.priority.urgent,
      },
    ];

  return (
    <>
      <div className="border-border bg-card animate-in fade-in slide-in-from-bottom-4 fixed start-1/2 bottom-8 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl border p-2 shadow-lg transition-all">
        <div className="bg-muted/20 border-border/40 flex items-center gap-3 rounded-xl border px-4 py-2">
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground/40 mb-1 text-right text-[7px] leading-none font-bold tracking-tight">
              {common.buttons.selectionMode}
            </span>
            <div className="flex items-center gap-2">
              <Terminal className="text-primary size-3" />
              <span className="text-xs font-bold">
                {digitsEnToFa(selectedCount)} {tasks.pagination.items}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            disabled={isLoading}
            className="size-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-500"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="bg-border/40 h-8 w-px" />

        <div className="flex items-center gap-2">
          {/* Bulk Assign */}
          <Select onValueChange={handleBulkAssign} disabled={isLoading}>
            <SelectTrigger className="border-border/40 bg-muted/5 h-10 w-[160px] rounded-xl text-[10px] font-bold tracking-tight focus:ring-0">
              <Users className="ms-2 size-3.5 opacity-40" />
              <SelectValue placeholder={tasks.bulkActions.assignPlaceholder} />
            </SelectTrigger>
            <SelectContent className="border-border rounded-xl border">
              {users.length === 0 ? (
                <SelectItem value="__empty" disabled>
                  {common.messages.noData}
                </SelectItem>
              ) : (
                users.map((user) => (
                  <SelectItem
                    key={user.id}
                    value={user.id}
                    className="text-[10px] font-bold"
                  >
                    {user.first_name || user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.username}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {/* Bulk Status Change */}
          <Select onValueChange={handleBulkStatus} disabled={isLoading}>
            <SelectTrigger className="border-border/40 bg-muted/5 h-10 w-[140px] rounded-xl text-[10px] font-bold tracking-tight focus:ring-0">
              <RefreshCw className="ms-2 size-3.5 opacity-40" />
              <SelectValue placeholder={tasks.bulkActions.statusPlaceholder} />
            </SelectTrigger>
            <SelectContent className="border-border rounded-xl border">
              {availableStatuses.map((status) => (
                <SelectItem
                  key={status.value}
                  value={status.value}
                  className="text-[10px] font-bold"
                >
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bulk Priority Change */}
          <Select onValueChange={handleBulkPriority} disabled={isLoading}>
            <SelectTrigger className="border-border/40 bg-muted/5 h-10 w-[130px] rounded-xl text-[10px] font-bold tracking-tight focus:ring-0">
              <Flag className="ms-2 size-3.5 opacity-40" />
              <SelectValue
                placeholder={tasks.bulkActions.priorityPlaceholder}
              />
            </SelectTrigger>
            <SelectContent className="border-border rounded-xl border">
              {priorityOptions.map((priority) => (
                <SelectItem
                  key={priority.value}
                  value={priority.value}
                  className="text-[10px] font-bold"
                >
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-border/40 h-8 w-px" />

        {/* Bulk Delete */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isLoading}
          className="h-10 rounded-xl px-4 text-[10px] font-bold tracking-tight text-rose-500 hover:bg-rose-500/10"
        >
          <Trash2 className="ms-2 size-4" />
          {tasks.bulkActions.deleteButton}
        </Button>
      </div>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={tasks.bulkActions.deleteDialogTitle.replace(
          "{count}",
          digitsEnToFa(selectedCount),
        )}
        description={tasks.bulkActions.deleteDialogDescription}
        onConfirm={handleDelete}
        isLoading={isLoading}
        confirmText={
          isLoading
            ? tasks.bulkActions.deletingButton
            : tasks.bulkActions.deleteButton
        }
        cancelText={tasks.bulkActions.cancelButton}
        icon={<Trash2 className="size-5" />}
      />
    </>
  );
}
