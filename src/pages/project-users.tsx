import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash } from "lucide-react";
import { useParams } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { TEXT } from "@/constants/text";
import { pb } from "@/lib/pocketbase";
import { UsersResponse, UsersRoleOptions } from "@/lib/pocketbase-types";
import { getUserInitials } from "@/lib/utils";
import { useSpecificProjectUsers } from "@/pb-hooks";
import { useAuthStore } from "@/store/auth-store";

export default function ProjectUsers() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore().user;
  const queryClient = useQueryClient();
  const isAdmin = user?.role === UsersRoleOptions.admin;
  const isSupervisor = user?.role === UsersRoleOptions.supervisor;
  const canManageUsers = isAdmin || isSupervisor;

  // Get project users
  const { data: projectUsers } = useSpecificProjectUsers(id as string);

  // Get all users for adding new users to project
  const { data: allUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => pb.collection("users").getFullList<UsersResponse>(),
    enabled: canManageUsers,
  });

  // Add user to project
  const { mutate: addUserToProject } = useMutation({
    mutationFn: async (userId: string) => {
      return pb.collection("users_projects").create({
        user: userId,
        project: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-users", id] });
    },
  });

  // Remove user from project
  const { mutate: removeUserFromProject } = useMutation({
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
    },
  });

  // Filter out users that are already in the project
  const availableUsers = allUsers?.filter(
    (user) => !projectUsers?.some((pu) => pu.id === user.id),
  );

  return (
    <div className="mt-4 flex flex-col space-y-4 bg-white px-4 pb-8 text-gray-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{TEXT.projects.users.title}</h1>
          {projectUsers && (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-600">
              {projectUsers.length} {TEXT.projects.users.count}
            </span>
          )}
        </div>
        {canManageUsers && (
          <Dialog>
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
            {projectUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="flex">
                  <div className="flex items-center justify-end gap-2 self-start">
                    <Avatar>
                      <AvatarFallback>
                        {getUserInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.username}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">کارمند</TableCell>
                {canManageUsers && (
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => removeUserFromProject(user.id)}
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
    </div>
  );
}
