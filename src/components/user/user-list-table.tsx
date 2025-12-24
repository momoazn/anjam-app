import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  Edit,
  History,
  Lock,
  Power,
  ShieldAlert,
  Trash,
  Unlock,
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { common, notifications, users as usersText } from "@/constants";
import { UsersResponse, GroupsResponse } from "@/lib/pocketbase-types";
import { useDeleteUser, useToggleUserActive, useUnblockUser } from "@/hooks";
import { UserAvatar } from "../user-avatar";
import { UserLoginLogsDialog } from "./user-login-logs-dialog";

type UserListTableProps = {
  users: UsersResponse<{ group: GroupsResponse }>[];
  onEdit: (user: UsersResponse<{ group: GroupsResponse }>) => void;
  onDelete: (user: UsersResponse<{ group: GroupsResponse }>) => void;
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
  const [selectedUserForLogs, setSelectedUserForLogs] = useState<UsersResponse<{
    group: GroupsResponse;
  }> | null>(null);
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
    <>
      {isAdmin && selectedIds.length > 0 ? (
        <div className="bg-muted mb-3 flex flex-wrap items-center gap-2 rounded-lg p-2">
          <span className="text-sm font-medium">
            {digitsEnToFa(selectedIds.length)} {notifications.selected}
          </span>
          <Button size="sm" variant="outline" onClick={bulkToggleActive}>
            {usersText.bulk.toggleActive}
          </Button>
          <Button size="sm" variant="outline" onClick={bulkUnblock}>
            {usersText.bulk.unblock}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setBulkDeleteOpen(true)}
          >
            {usersText.bulk.delete}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
            {notifications.deselectAll}
          </Button>
        </div>
      ) : null}
      <Table data-animate-stagger>
        <TableHeader>
          <TableRow>
            {isAdmin ? (
              <TableHead className="w-10 text-center">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label={notifications.selectAll}
                />
              </TableHead>
            ) : null}
            <TableHead className="text-right">
              {usersText.table.columns.user}
            </TableHead>
            <TableHead className="text-right">
              {usersText.table.columns.username}
            </TableHead>
            <TableHead className="text-right">
              {usersText.table.columns.role}
            </TableHead>
            <TableHead className="text-right">
              {usersText.table.columns.group}
            </TableHead>
            {isAdmin && (
              <>
                <TableHead className="text-center">
                  {usersText.table.columns.status}
                </TableHead>
                <TableHead className="text-center">
                  {usersText.table.columns.accountStatus}
                </TableHead>
                <TableHead className="text-center">
                  {usersText.table.columns.failedAttempts}
                </TableHead>
                <TableHead className="w-[150px] text-center">
                  {usersText.table.columns.actions}
                </TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody data-animate-stagger>
          {users.map((user) => (
            <TableRow key={user.id} data-interactive-item>
              {isAdmin ? (
                <TableCell className="w-10 text-center">
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onCheckedChange={() => toggleSelect(user.id)}
                    aria-label={notifications.selected}
                    disabled={user.role === "admin"}
                  />
                </TableCell>
              ) : null}
              <TableCell className="flex text-right">
                <div className="flex items-center justify-end gap-2 self-start">
                  <UserAvatar user={user} />
                  <div>
                    <div className="font-medium">
                      {user.first_name} {user.last_name}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">{user.username}</TableCell>
              <TableCell className="text-right capitalize">
                {usersText.table.roles[user.role]}
              </TableCell>
              <TableCell className="text-right">
                {user.expand?.group?.name ? user.expand.group.name : "-"}
              </TableCell>
              {isAdmin && (
                <>
                  <TableCell className="text-center">
                    <Badge
                      variant={user.active ? "default" : "secondary"}
                      className="gap-1"
                    >
                      <Power className="size-3" />
                      {user.active
                        ? usersText.table.status.active
                        : usersText.table.status.inactive}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={user.blocked ? "destructive" : "outline"}
                      className="gap-1"
                    >
                      {user.blocked ? (
                        <>
                          <Lock className="size-3" />
                          {usersText.table.status.blocked}
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="size-3" />
                          {usersText.table.status.ok}
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {user.failed_login_attempts ? (
                      <Badge variant="secondary">
                        {digitsEnToFa(user.failed_login_attempts)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(user)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <ShieldAlert className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(user)}
                            disabled={
                              toggleActiveMutation.isPending ||
                              user.role === "admin"
                            }
                          >
                            <Power className="ml-2 size-4" />
                            {user.active
                              ? usersText.actions.deactivate
                              : usersText.actions.activate}
                          </DropdownMenuItem>
                          {user.blocked && (
                            <DropdownMenuItem
                              onClick={() => handleUnblock(user)}
                              disabled={unblockUserMutation.isPending}
                            >
                              <Unlock className="ml-2 size-4" />
                              {usersText.actions.unblock}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setSelectedUserForLogs(user)}
                          >
                            <History className="ml-2 size-4" />
                            {usersText.actions.viewLogs}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => onDelete(user)}
                        aria-label={usersText.delete.title}
                      >
                        <Trash className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedUserForLogs && (
        <UserLoginLogsDialog
          user={selectedUserForLogs}
          open={!!selectedUserForLogs}
          onOpenChange={(open) => !open && setSelectedUserForLogs(null)}
        />
      )}

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="text-right">
          <AlertDialogHeader>
            <AlertDialogTitle>{usersText.bulk.delete}</AlertDialogTitle>
            <AlertDialogDescription>
              {usersText.bulk.deleteConfirm.replace(
                "{count}",
                digitsEnToFa(selectedIds.length).toString(),
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse sm:justify-start">
            <AlertDialogCancel>{common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {usersText.delete.title}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
