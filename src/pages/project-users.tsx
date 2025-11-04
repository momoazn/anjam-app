import { queryKeys } from "@/hooks/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserAvatar } from "@/components/user-avatar";
import { fa } from "@/constants/text";
import {
  useProjectUsersFromAppData,
  useProjectWithSupervisor,
  useUsers,
} from "@/hooks";
import { pb } from "@/lib/pocketbase";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";

export default function ProjectUsers() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthUser();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === UsersRoleOptions.admin;
  const isSupervisor = user?.role === UsersRoleOptions.supervisor;
  const canManageUsers = isAdmin || isSupervisor;
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<{
    id: string;
    username: string;
  } | null>(null);

  const { data: project } = useProjectWithSupervisor({
    id: id as string,
  });
  const { data: projectUsers } = useProjectUsersFromAppData(id as string);

  // Get all users for adding new users to project
  const { data: allUsers } = useUsers({ enabled: canManageUsers });

  // Add user to project
  const { mutate: addUserToProject, isPending: isAddingUser } = useMutation({
    mutationFn: async (userId: string) => {
      return pb.collection("users_projects").create({
        user: userId,
        project: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.allProjectUsers(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      if (id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(id),
        });
      }
      setIsAddUserOpen(false);
      toast.success(fa.projects.users.addSuccess);
    },
    onError: (error) => {
      toast.error(fa.projects.users.addError);
      console.error("Error adding user to project:", error);
    },
  });

  // Remove user from project
  const { mutate: removeUserFromProject, isPending: isRemovingUser } =
    useMutation({
      mutationFn: async (userId: string) => {
        // First, unassign all tasks in this project that are assigned to this user
        const tasks = await pb.collection("tasks").getFullList({
          filter: `project = "${id}" && assignee = "${userId}"`,
        });

        // Update all matching tasks to have no assignee
        await Promise.all(
          tasks.map((task) =>
            pb.collection("tasks").update(task.id, { assignee: "" }),
          ),
        );

        // Then remove the user from the project
        const records = await pb.collection("users_projects").getFullList({
          filter: `user = "${userId}" && project = "${id}"`,
        });
        if (records.length > 0) {
          return pb.collection("users_projects").delete(records[0].id);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.allProjectUsers(),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
        if (id) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.projects.detail(id),
          });
        }
        setIsRemoveDialogOpen(false);
        setUserToRemove(null);
        toast.success(fa.projects.users.removeSuccess);
      },
      onError: (error) => {
        toast.error(fa.projects.users.removeError);
        console.error("Error removing user from project:", error);
      },
    });

  // Filter out users that are already in the project
  const availableUsers = allUsers?.filter(
    (user) => !projectUsers?.some((pu) => pu.id === user.id),
  );

  return (
    <PageTransition className="text-foreground mt-4 flex flex-col space-y-4 px-4 pb-8">
      <div className="flex items-center justify-between" data-animate-stagger>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{fa.projects.users.title}</h1>
          {projectUsers && (
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-sm">
              {projectUsers.length} {fa.projects.users.count}
            </span>
          )}
        </div>
        {canManageUsers && (
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                {fa.projects.users.add}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{fa.projects.users.addDialog.title}</DialogTitle>
              </DialogHeader>
              <Select
                onValueChange={(value) => {
                  addUserToProject(value);
                }}
                disabled={isAddingUser}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={fa.projects.users.addDialog.selectPlaceholder}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="rounded-md border" data-animate-stagger>
        <Table dir="rtl" data-animate-stagger>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">
                {fa.projects.users.table.user}
              </TableHead>
              <TableHead className="text-center">
                {fa.projects.users.table.role}
              </TableHead>
              {canManageUsers && (
                <TableHead className="w-[100px] text-center">
                  {fa.projects.users.table.actions}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody data-animate-stagger>
            <TableRow data-interactive-item>
              <TableCell className="flex">
                <div className="flex items-center justify-end gap-2 self-start">
                  <UserAvatar user={project?.expand?.supervisor} />
                  <span>{project?.expand?.supervisor.username}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                {fa.users.table.roles.supervisor}
              </TableCell>
            </TableRow>
            {projectUsers?.map((user) => (
              <TableRow key={user.id} data-interactive-item>
                <TableCell className="flex">
                  <div className="flex items-center justify-end gap-2 self-start">
                    <UserAvatar user={user} />
                    <span>{user.username}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {fa.users.table.roles.employee}
                </TableCell>
                {canManageUsers && (
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => {
                        setUserToRemove({ id: user.id, username: user.username });
                        setIsRemoveDialogOpen(true);
                      }}
                      disabled={isRemovingUser}
                    >
                      <Trash className="size-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
      >
        <AlertDialogContent className="text-right">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-lg font-bold">
              {fa.projects.users.remove.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-right">
              {fa.projects.users.remove.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse sm:justify-start">
            <AlertDialogCancel className="order-2">
              {fa.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToRemove) {
                  removeUserFromProject(userToRemove.id);
                }
              }}
              disabled={isRemovingUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 order-1"
            >
              {isRemovingUser ? (
                <Loader2 className="text-muted-foreground ml-2 size-4 animate-spin" />
              ) : null}
              {fa.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
