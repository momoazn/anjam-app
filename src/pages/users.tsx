import { digitsEnToFa } from "@persian-tools/persian-tools";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { CreateUserDialog } from "@/components/user/create-user-dialog";
import { DeleteUserDialog } from "@/components/user/delete-user-dialog";
import { EditUserDialog } from "@/components/user/edit-user-dialog";
import { UserListTable } from "@/components/user/user-list-table";
import { TEXT } from "@/constants/text";
import { pb } from "@/lib/pocketbase";
import { UsersResponse, UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthStore } from "@/store/auth-store";

export default function Users() {
  const user = useAuthStore().user;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsersResponse | null>(null);

  const { data: users, isPending: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => {
      return pb.collection("users").getFullList<UsersResponse>({
        batch: 100,
      });
    },
  });

  const isAdmin = user?.role === UsersRoleOptions.admin;

  const handleEdit = (user: UsersResponse) => {
    if (!isAdmin) return;
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleDelete = (user: UsersResponse) => {
    if (!isAdmin) return;
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <div className="bg-card text-foreground mt-4 flex flex-col space-y-4 px-4 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{TEXT.users.title}</h1>
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-sm">
              {TEXT.users.list.count.replace(
                "{count}",
                digitsEnToFa(users?.length ?? 0).toString(),
              )}
            </span>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 size-4" />
              {TEXT.users.create.button}
            </Button>
          )}
        </div>
        {isLoadingUsers ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-4 animate-spin" />
          </div>
        ) : (
          <UserListTable
            users={users ?? []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isAdmin={isAdmin}
          />
        )}
      </div>

      <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <EditUserDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={selectedUser}
      />
      <DeleteUserDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        user={selectedUser}
      />
    </>
  );
}
