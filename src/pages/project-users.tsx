import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { TEXT } from "@/constants/text";
import { pb } from "@/lib/pocketbase";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import {
  useProjectWithSupervisor,
  useProjectUsers,
  useUsers,
} from "@/pb-hooks";
import { useAuthUser } from "@/store/auth-store";

export default function ProjectUsers() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthUser();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === UsersRoleOptions.admin;
  const isSupervisor = user?.role === UsersRoleOptions.supervisor;
  const canManageUsers = isAdmin || isSupervisor;
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const { data: project } = useProjectWithSupervisor({
    id: id as string,
  });
  const { data: projectUsers } = useProjectUsers({ projectId: id as string });

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
      queryClient.invalidateQueries({ queryKey: ["project-users", id] });
      setIsAddUserOpen(false);
      toast.success(TEXT.projects.users.addSuccess);
    },
    onError: (error) => {
      toast.error(TEXT.projects.users.addError);
      console.error("Error adding user to project:", error);
    },
  });

  // Remove user from project
  const { mutate: removeUserFromProject, isPending: isRemovingUser } =
    useMutation({
      mutationFn: async (userId: string) => {
        const records = await pb.collection("users_projects").getFullList({
          filter: `user = "${userId}" && project = "${id}"`,
        });
        if (records.length > 0) {
          return pb.collection("users_projects").delete(records[0].id);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["project-users", id] });
        toast.success(TEXT.projects.users.removeSuccess);
      },
      onError: (error) => {
        toast.error(TEXT.projects.users.removeError);
        console.error("Error removing user from project:", error);
      },
    });

  // Filter out users that are already in the project
  const availableUsers = allUsers?.filter(
    (user) => !projectUsers?.some((pu) => pu.id === user.id),
  );

  return (
    <div className="text-foreground mt-4 flex flex-col space-y-4 px-4 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{TEXT.projects.users.title}</h1>
          {projectUsers && (
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-sm">
              {projectUsers.length} {TEXT.projects.users.count}
            </span>
          )}
        </div>
        {canManageUsers && (
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                {TEXT.projects.users.add}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{TEXT.projects.users.addDialog.title}</DialogTitle>
              </DialogHeader>
              <Select
                onValueChange={(value) => {
                  addUserToProject(value);
                }}
                disabled={isAddingUser}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      TEXT.projects.users.addDialog.selectPlaceholder
                    }
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

      <div className="rounded-md border">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">
                {TEXT.projects.users.table.user}
              </TableHead>
              <TableHead className="text-center">
                {TEXT.projects.users.table.role}
              </TableHead>
              {canManageUsers && (
                <TableHead className="w-[100px] text-center">
                  {TEXT.projects.users.table.actions}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="flex">
                <div className="flex items-center justify-end gap-2 self-start">
                  <UserAvatar user={project?.expand?.supervisor} />
                  <span>{project?.expand?.supervisor.username}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">سرپرست</TableCell>
            </TableRow>
            {projectUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="flex">
                  <div className="flex items-center justify-end gap-2 self-start">
                    <UserAvatar user={user} />
                    <span>{user.username}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">کارمند</TableCell>
                {canManageUsers && (
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeUserFromProject(user.id)}
                      disabled={isRemovingUser}
                    >
                      {isRemovingUser ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash className="size-4" />
                      )}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
