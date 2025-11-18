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
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fa } from "@/constants/text";
import { UsersResponse } from "@/lib/pocketbase-types";
import { pb } from "@/lib/pocketbase";
import { UserAvatar } from "../user-avatar";
import { UserLoginLogsDialog } from "./user-login-logs-dialog";

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
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleToggleActive = async (user: UsersResponse) => {
    if (!isAdmin) return;

    setActionLoading(user.id);
    try {
      const response = await fetch(
        `${pb.baseUrl}api/tm/users/${user.id}/toggle-active`,
        {
          method: "PATCH",
          headers: {
            Authorization: pb.authStore.token,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || fa.users.actions.toggleStatusError);
      }

      const data = await response.json();
      toast.success(data.message);
      onUpdate?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : fa.users.actions.activateError,
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (user: UsersResponse) => {
    if (!isAdmin) return;

    setActionLoading(user.id);
    try {
      const response = await fetch(
        `${pb.baseUrl}api/tm/users/${user.id}/unblock`,
        {
          method: "PATCH",
          headers: {
            Authorization: pb.authStore.token,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || fa.users.actions.unblockError);
      }

      const data = await response.json();
      toast.success(data.message);
      onUpdate?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : fa.users.actions.unblockError,
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <Table data-animate-stagger>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">
              {fa.users.table.columns.user}
            </TableHead>
            <TableHead className="text-right">
              {fa.users.table.columns.username}
            </TableHead>
            <TableHead className="text-right">
              {fa.users.table.columns.role}
            </TableHead>
            {isAdmin && (
              <>
                <TableHead className="text-center">
                  {fa.users.table.columns.status}
                </TableHead>
                <TableHead className="text-center">
                  {fa.users.table.columns.accountStatus}
                </TableHead>
                <TableHead className="text-center">
                  {fa.users.table.columns.failedAttempts}
                </TableHead>
                <TableHead className="w-[150px] text-center">
                  {fa.users.table.columns.actions}
                </TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody data-animate-stagger>
          {users.map((user) => (
            <TableRow key={user.id} data-interactive-item>
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
                {fa.users.table.roles[user.role]}
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
                        ? fa.users.table.status.active
                        : fa.users.table.status.inactive}
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
                          {fa.users.table.status.blocked}
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="size-3" />
                          {fa.users.table.status.ok}
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
                              actionLoading === user.id || user.role === "admin"
                            }
                          >
                            <Power className="ml-2 size-4" />
                            {user.active
                              ? fa.users.actions.deactivate
                              : fa.users.actions.activate}
                          </DropdownMenuItem>
                          {user.blocked && (
                            <DropdownMenuItem
                              onClick={() => handleUnblock(user)}
                              disabled={actionLoading === user.id}
                            >
                              <Unlock className="ml-2 size-4" />
                              {fa.users.actions.unblock}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setSelectedUserForLogs(user)}
                          >
                            <History className="ml-2 size-4" />
                            {fa.users.actions.viewLogs}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => onDelete(user)}
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
    </>
  );
}
