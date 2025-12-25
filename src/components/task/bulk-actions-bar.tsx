import { X, Trash2, Users, Flag, RefreshCw, Terminal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { common, tasks } from "@/constants";
import {
  TasksPriorityOptions,
  type TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { digitsEnToFa } from "@persian-tools/persian-tools";

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
          String(selectedCount),
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
          String(selectedCount),
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
          String(selectedCount),
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
      <div className="border-foreground bg-card animate-in fade-in slide-in-from-bottom-4 fixed start-1/2 bottom-8 z-50 flex -translate-x-1/2 items-center gap-4 rounded-none border-2 p-2 shadow-[-8px_8px_0px_0px_rgba(0,0,0,1)] transition-all dark:shadow-[-8px_8px_0px_0px_rgba(255,255,255,0.1)]">
        <div className="bg-muted/20 border-border/40 flex items-center gap-3 border px-4 py-2">
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground/40 mb-1 text-right text-[7px] leading-none font-black tracking-[0.3em] uppercase">
              Selection_Mode
            </span>
            <div className="flex items-center gap-2">
              <Terminal className="text-primary size-3" />
              <span className="text-xs font-black uppercase">
                {digitsEnToFa(selectedCount)} ITEMS
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            disabled={isLoading}
            className="size-8 rounded-none hover:bg-rose-500/10 hover:text-rose-500"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="bg-border/40 h-8 w-px" />

        <div className="flex items-center gap-2">
          {/* Bulk Assign */}
          <Select onValueChange={handleBulkAssign} disabled={isLoading}>
            <SelectTrigger className="border-border/40 bg-muted/5 h-10 w-[160px] rounded-none text-[10px] font-bold tracking-widest uppercase focus:ring-0">
              <Users className="ms-2 size-3.5 opacity-40" />
              <SelectValue placeholder={tasks.bulkActions.assignPlaceholder} />
            </SelectTrigger>
            <SelectContent className="border-foreground rounded-none border-2">
              {users.length === 0 ? (
                <SelectItem value="__empty" disabled>
                  {common.messages.noData}
                </SelectItem>
              ) : (
                users.map((user) => (
                  <SelectItem
                    key={user.id}
                    value={user.id}
                    className="text-[10px] font-bold uppercase"
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
            <SelectTrigger className="border-border/40 bg-muted/5 h-10 w-[140px] rounded-none text-[10px] font-bold tracking-widest uppercase focus:ring-0">
              <RefreshCw className="ms-2 size-3.5 opacity-40" />
              <SelectValue placeholder={tasks.bulkActions.statusPlaceholder} />
            </SelectTrigger>
            <SelectContent className="border-foreground rounded-none border-2">
              {availableStatuses.map((status) => (
                <SelectItem
                  key={status.value}
                  value={status.value}
                  className="text-[10px] font-bold uppercase"
                >
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bulk Priority Change */}
          <Select onValueChange={handleBulkPriority} disabled={isLoading}>
            <SelectTrigger className="border-border/40 bg-muted/5 h-10 w-[130px] rounded-none text-[10px] font-bold tracking-widest uppercase focus:ring-0">
              <Flag className="ms-2 size-3.5 opacity-40" />
              <SelectValue
                placeholder={tasks.bulkActions.priorityPlaceholder}
              />
            </SelectTrigger>
            <SelectContent className="border-foreground rounded-none border-2">
              {priorityOptions.map((priority) => (
                <SelectItem
                  key={priority.value}
                  value={priority.value}
                  className="text-[10px] font-bold uppercase"
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
          className="h-10 rounded-none px-4 text-[10px] font-black tracking-widest text-rose-500 uppercase hover:bg-rose-500/10"
        >
          <Trash2 className="ms-2 size-4" />
          {tasks.bulkActions.deleteButton}
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-foreground rounded-none border-2 shadow-[-8px_8px_0px_0px_rgba(0,0,0,1)]">
          <AlertDialogHeader>
            <div className="mb-2 flex items-center gap-3 text-rose-500">
              <Trash2 className="size-5" />
              <AlertDialogTitle className="text-xl font-black tracking-tight uppercase">
                {tasks.bulkActions.deleteDialogTitle.replace(
                  "{count}",
                  digitsEnToFa(selectedCount),
                )}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm font-bold opacity-70">
              {tasks.bulkActions.deleteDialogDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel
              disabled={isLoading}
              className="border-foreground rounded-none border-2 text-[10px] font-black tracking-widest uppercase"
            >
              {tasks.bulkActions.cancelButton}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="border-foreground rounded-none border-2 bg-rose-500 text-[10px] font-black tracking-widest text-white uppercase shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-600 active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none"
            >
              {isLoading
                ? tasks.bulkActions.deletingButton
                : tasks.bulkActions.deleteButton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
