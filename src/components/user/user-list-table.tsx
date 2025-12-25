import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconPencil,
  IconHistory,
  IconPower,
  IconShield,
  IconTrash,
  IconLockOpen,
  IconTerminal,
  IconX,
  IconHash,
} from "@tabler/icons-react";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { common, notifications, users as usersText } from "@/constants";
import { UsersResponse } from "@/lib/pocketbase-types";
import { useDeleteUser, useToggleUserActive, useUnblockUser } from "@/hooks";
import { UserAvatar } from "../user-avatar";
import { UserLoginLogsDialog } from "./user-login-logs-dialog";
import { cn } from "@/lib/utils";

type UserListTableProps = {
  users: UsersResponse[];
  onEdit: (user: UsersResponse) => void;
  onDelete: (user: UsersResponse) => void;
  isAdmin: boolean;
  onUpdate?: () => void;
};

export function UserListTable({
  users,
  onEdit,
  onDelete,
  isAdmin,
  onUpdate,
}: UserListTableProps) {
  const [selectedUserForLogs, setSelectedUserForLogs] =
    useState<UsersResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const toggleActiveMutation = useToggleUserActive({
    onSuccess: (data) => {
      toast.success(data.meta.message);
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : usersText.actions.toggleStatusError,
      );
    },
  });

  const unblockUserMutation = useUnblockUser({
    onSuccess: (data) => {
      toast.success(data.meta.message);
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : usersText.actions.unblockError,
      );
    },
  });

  const deleteUserMutation = useDeleteUser({
    onSuccess: () => {
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : usersText.actions.deleteError,
      );
    },
  });

  const selectableUsers = useMemo(() => {
    if (!isAdmin) return [];
    return users.filter((u) => u.role !== "admin");
  }, [users, isAdmin]);

  const allSelected =
    selectableUsers.length > 0
      ? selectableUsers.every((u) => selectedIds.includes(u.id))
      : false;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(selectableUsers.map((u) => u.id));
  };

  const bulkToggleActive = async () => {
    if (!isAdmin || selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) => toggleActiveMutation.mutateAsync(id)),
      );
      toast.success(usersText.bulk.updated);
      setSelectedIds([]);
    } catch {
      toast.error(usersText.bulk.error);
    }
  };

  const bulkUnblock = async () => {
    if (!isAdmin || selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) => unblockUserMutation.mutateAsync(id)),
      );
      toast.success(usersText.bulk.updated);
      setSelectedIds([]);
    } catch {
      toast.error(usersText.bulk.error);
    }
  };

  const confirmBulkDelete = async () => {
    if (!isAdmin || selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) => deleteUserMutation.mutateAsync(id)),
      );
      toast.success(usersText.bulk.deleted);
      setSelectedIds([]);
      setBulkDeleteOpen(false);
    } catch {
      toast.error(usersText.bulk.error);
    }
  };

  const handleToggleActive = (user: UsersResponse) => {
    if (!isAdmin) return;
    toggleActiveMutation.mutate(user.id);
  };

  const handleUnblock = (user: UsersResponse) => {
    if (!isAdmin) return;
    unblockUserMutation.mutate(user.id);
  };

  return (
    <div className="space-y-6">
      {isAdmin && selectedIds.length > 0 ? (
        <div className="bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-top-2 flex flex-wrap items-center gap-2 rounded-none border p-2 shadow-sm">
          <div className="bg-primary text-primary-foreground flex items-center gap-2 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase">
            <IconTerminal className="size-3" />
            {digitsEnToFa(selectedIds.length)} {notifications.selected}
          </div>
          <div className="bg-primary/20 mx-2 h-6 w-px" />
          <Button
            size="sm"
            variant="ghost"
            onClick={bulkToggleActive}
            className="hover:bg-primary/10 h-9 rounded-none text-[9px] font-black tracking-widest uppercase"
          >
            <IconPower className="ms-1.5 size-3.5" />
            {usersText.bulk.toggleActive}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={bulkUnblock}
            className="hover:bg-primary/10 h-9 rounded-none text-[9px] font-black tracking-widest uppercase"
          >
            <IconLockOpen className="ms-1.5 size-3.5" />
            {usersText.bulk.unblock}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setBulkDeleteOpen(true)}
            className="h-9 rounded-none text-[9px] font-black tracking-widest text-rose-500 uppercase hover:bg-rose-500/10"
          >
            <IconTrash className="ms-1.5 size-3.5" />
            {usersText.bulk.delete}
          </Button>
          <div className="ms-auto">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="h-9 rounded-none text-[9px] font-black tracking-widest uppercase opacity-60"
            >
              <IconX className="ms-1.5 size-3.5" />
              {notifications.deselectAll}
            </Button>
          </div>
        </div>
      ) : null}

      <div
        className="bg-border/40 border-border/40 grid grid-cols-1 gap-px overflow-hidden border"
        data-animate-stagger
      >
        {/* Table Head Protocol */}
        <div className="bg-muted/20 border-border/40 sticky top-0 z-10 grid h-10 grid-cols-12 border-b backdrop-blur-sm">
          {isAdmin && (
            <div className="border-border/10 col-span-1 flex items-center justify-center border-s">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                aria-label={notifications.selectAll}
                className="rounded-none"
              />
            </div>
          )}
          <div
            className={cn(
              "border-border/10 flex items-center justify-end border-s px-4",
              isAdmin ? "col-span-4" : "col-span-5",
            )}
          >
            <span className="text-[9px] font-black tracking-widest uppercase opacity-60">
              {usersText.table.columns.user}
            </span>
          </div>
          <div
            className={cn(
              "border-border/10 flex items-center justify-end border-s px-4",
              isAdmin ? "col-span-3" : "col-span-4",
            )}
          >
            <span className="text-[9px] font-black tracking-widest uppercase opacity-60">
              {usersText.table.columns.username}
            </span>
          </div>
          <div
            className={cn(
              "border-border/10 flex items-center justify-end border-s px-4",
              isAdmin ? "col-span-2" : "col-span-3",
            )}
          >
            <span className="text-[9px] font-black tracking-widest uppercase opacity-60">
              {usersText.table.columns.role}
            </span>
          </div>
          {isAdmin && (
            <div className="col-span-2 flex items-center justify-center px-4">
              <span className="text-[9px] font-black tracking-widest uppercase opacity-60">
                {usersText.table.columns.actions}
              </span>
            </div>
          )}
        </div>

        {/* Registry Modules */}
        {users.map((u) => (
          <div
            key={u.id}
            className="group bg-card hover:bg-muted/30 relative grid grid-cols-12 overflow-hidden text-right transition-all"
          >
            {isAdmin && (
              <div className="border-border/10 bg-muted/5 col-span-1 flex items-center justify-center border-s">
                <Checkbox
                  checked={selectedIds.includes(u.id)}
                  onCheckedChange={() => toggleSelect(u.id)}
                  aria-label={notifications.selected}
                  disabled={u.role === "admin"}
                  className="rounded-none"
                />
              </div>
            )}

            <div
              className={cn(
                "border-border/10 flex items-center justify-end gap-3 border-s px-4 py-3",
                isAdmin ? "col-span-4" : "col-span-5",
              )}
            >
              <div className="flex flex-col items-end">
                <span className="mb-1 text-[11px] leading-none font-black tracking-tight uppercase">
                  {u.first_name} {u.last_name}
                </span>
                <div className="flex items-center gap-1.5">
                  <IconHash className="size-2.5 opacity-20" />
                  <span className="font-mono text-[8px] font-black tracking-widest uppercase opacity-40">
                    {u.id.slice(0, 8)}
                  </span>
                </div>
              </div>
              <div className="relative shrink-0">
                <UserAvatar
                  user={u}
                  className="border-border/40 size-9 rounded-none border"
                />
                <div
                  className={cn(
                    "border-background absolute -end-0.5 -bottom-0.5 h-2 w-2 border shadow-[0_0_4px_rgba(0,0,0,0.2)]",
                    u.active ? "bg-emerald-500" : "bg-rose-500",
                  )}
                />
              </div>
            </div>

            <div
              className={cn(
                "border-border/10 flex items-center justify-end border-s px-4 py-3 font-mono text-[10px] font-black tracking-widest uppercase opacity-60",
                isAdmin ? "col-span-3" : "col-span-4",
              )}
            >
              {u.username}
            </div>

            <div
              className={cn(
                "border-border/10 flex items-center justify-end border-s px-4 py-3",
                isAdmin ? "col-span-2" : "col-span-3",
              )}
            >
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/5 text-primary rounded-none text-[9px] font-black tracking-widest uppercase"
              >
                {usersText.table.roles[u.role]}
              </Badge>
            </div>

            {isAdmin && (
              <div className="col-span-2 flex items-center justify-center gap-1 px-4 py-3">
                <div className="flex translate-y-1 items-center gap-1 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  {u.blocked && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-none text-rose-500 hover:bg-rose-500/10"
                      onClick={() => handleUnblock(u)}
                      title={usersText.actions.unblock}
                    >
                      <IconLockOpen className="size-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 hover:text-primary size-8 rounded-none"
                    onClick={() => onEdit(u)}
                    title={usersText.edit.title}
                  >
                    <IconPencil className="size-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted size-8 rounded-none"
                      >
                        <IconShield className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border-foreground bg-card rounded-none border-2"
                    >
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(u)}
                        disabled={
                          toggleActiveMutation.isPending || u.role === "admin"
                        }
                        className="rounded-none p-3 text-[9px] font-black tracking-widest uppercase"
                      >
                        <IconPower className="ms-2 size-4 opacity-40" />
                        {u.active
                          ? usersText.actions.deactivate
                          : usersText.actions.activate}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border/40" />
                      <DropdownMenuItem
                        onClick={() => setSelectedUserForLogs(u)}
                        className="rounded-none p-3 text-[9px] font-black tracking-widest uppercase"
                      >
                        <IconHistory className="ms-2 size-4 opacity-40" />
                        {usersText.actions.viewLogs}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-none text-rose-500 hover:bg-rose-500/10"
                    onClick={() => onDelete(u)}
                    title={usersText.delete.title}
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-primary absolute end-0 bottom-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full" />
          </div>
        ))}
      </div>

      {selectedUserForLogs && (
        <UserLoginLogsDialog
          user={selectedUserForLogs}
          open={!!selectedUserForLogs}
          onOpenChange={(open) => !open && setSelectedUserForLogs(null)}
        />
      )}

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="border-foreground rounded-none border-2 shadow-[-8px_8px_0px_0px_rgba(0,0,0,1)]">
          <AlertDialogHeader>
            <div className="mb-2 flex items-center gap-3 text-rose-500">
              <IconTrash className="size-5" />
              <AlertDialogTitle className="text-xl font-black tracking-tight uppercase">
                {usersText.bulk.delete}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm font-bold opacity-70">
              {usersText.bulk.deleteConfirm.replace(
                "{count}",
                digitsEnToFa(selectedIds.length).toString(),
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="border-foreground rounded-none border-2 text-[10px] font-black tracking-widest uppercase">
              {common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="border-foreground rounded-none border-2 bg-rose-500 text-[10px] font-black tracking-widest text-white uppercase shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-600 active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none"
            >
              {usersText.delete.title}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
