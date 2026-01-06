import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconHash,
  IconPencil,
  IconTerminal,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { EmptyStateNoUsers } from "@/components/ui/empty-state";
import { notifications, users as usersText } from "@/constants";
import { useDeleteUser } from "@/hooks";
import type { UserWithCompatibility } from "@/types/user";
import { cn } from "@/lib/utils";

import { UserAvatar } from "../user-avatar";

type UserListTableProps = {
  users: UserWithCompatibility[];
  onEdit: (user: UserWithCompatibility) => void;
  onDelete: (user: UserWithCompatibility) => void;
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

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
    // In Convex v1, only "owner" role cannot be modified, "member" can
    return users.filter((u) => u.role !== "owner");
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

  return (
    <div className="space-y-6">
      {users.length === 0 ? (
        <EmptyStateNoUsers />
      ) : (
        <>
          {isAdmin && selectedIds.length > 0 ? (
            <div className="bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-top-2 flex flex-wrap items-center gap-2 rounded-2xl border p-2 shadow-sm">
              <div className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-4 py-1.5 text-[10px] font-bold tracking-tight">
                <IconTerminal className="size-3" />
                {digitsEnToFa(selectedIds.length)} {notifications.selected}
              </div>
              <div className="bg-primary/20 mx-2 h-6 w-px" />
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setBulkDeleteOpen(true)}
                className="text-rose-500 hover:bg-rose-500/10"
              >
                <IconTrash className="ms-1.5 size-3.5" />
                {usersText.bulk.delete}
              </Button>
              <div className="ms-auto">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setSelectedIds([])}
                  className="opacity-60"
                >
                  <IconX className="ms-1.5 size-3.5" />
                  {notifications.deselectAll}
                </Button>
              </div>
            </div>
          ) : null}

          <div
            className="bg-border/15 border-border/15 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border"
            data-animate-stagger
          >
            {/* Table Head  */}
            <div className="bg-muted/20 border-border/15 sticky top-0 z-10 grid h-10 grid-cols-12 border-b backdrop-blur-sm">
              {isAdmin && (
                <div className="border-border/10 col-span-1 flex items-center justify-center border-s">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label={notifications.selectAll}
                    className="rounded-md"
                  />
                </div>
              )}
              <div
                className={cn(
                  "border-border/10 flex items-center justify-end border-s px-4",
                  isAdmin ? "col-span-4" : "col-span-5",
                )}
              >
                <span className="text-[10px] font-bold tracking-tight opacity-60">
                  {usersText.table.columns.user}
                </span>
              </div>
              <div
                className={cn(
                  "border-border/10 flex items-center justify-end border-s px-4",
                  isAdmin ? "col-span-3" : "col-span-4",
                )}
              >
                <span className="text-[10px] font-bold tracking-tight opacity-60">
                  {usersText.table.columns.username}
                </span>
              </div>
              <div
                className={cn(
                  "border-border/10 flex items-center justify-end border-s px-4",
                  isAdmin ? "col-span-2" : "col-span-3",
                )}
              >
                <span className="text-[10px] font-bold tracking-tight opacity-60">
                  {usersText.table.columns.role}
                </span>
              </div>
              {isAdmin && (
                <div className="col-span-2 flex items-center justify-center px-4">
                  <span className="text-[10px] font-bold tracking-tight opacity-60">
                    {usersText.table.columns.actions}
                  </span>
                </div>
              )}
            </div>

            {/*  Modules */}
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
                      disabled={u.role === "owner"}
                      className="rounded-md"
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
                    <span className="mb-1 text-[11px] leading-none font-bold tracking-tight">
                      {u.first_name} {u.last_name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <IconHash className="size-2.5 opacity-20" />
                      <span className="font-mono text-[8px] font-bold tracking-tight opacity-40">
                        {u.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                  <div className="relative shrink-0">
                    <UserAvatar
                      user={u}
                      className="border-border/15 size-9 rounded-full border"
                    />
                    <div
                      className={cn(
                        "border-background absolute -end-0.5 -bottom-0.5 h-2 w-2 rounded-full border shadow-[0_0_4px_rgba(0,0,0,0.2)]",
                        (u as any).active !== false ? "bg-emerald-500" : "bg-rose-500",
                      )}
                    />
                  </div>
                </div>

                <div
                  className={cn(
                    "border-border/10 flex items-center justify-end border-s px-4 py-3 font-mono text-[10px] font-bold tracking-tight opacity-60",
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
                    className="border-primary/20 bg-primary/5 text-primary rounded-lg text-[10px] font-bold tracking-tight"
                  >
                    {usersText.table.roles[u.role as keyof typeof usersText.table.roles] ||
                      u.role}
                  </Badge>
                </div>

                {isAdmin && (
                  <div className="col-span-2 flex items-center justify-center gap-1 px-4 py-3">
                    <div className="flex translate-y-1 items-center gap-1 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-primary/10 hover:text-primary size-8 rounded-lg"
                        onClick={() => onEdit(u)}
                        title={usersText.edit.title}
                      >
                        <IconPencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-rose-500 hover:bg-rose-500/10"
                        onClick={() => onDelete(u)}
                        title={usersText.delete.title}
                      >
                        <IconTrash className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <DeleteConfirmationDialog
            open={bulkDeleteOpen}
            onOpenChange={setBulkDeleteOpen}
            title={usersText.bulk.delete}
            description={usersText.bulk.deleteConfirm.replace(
              "{count}",
              digitsEnToFa(selectedIds.length).toString(),
            )}
            onConfirm={confirmBulkDelete}
            isLoading={deleteUserMutation.isPending}
            confirmText={usersText.delete.title}
          />
        </>
      )}
    </div>
  );
}
