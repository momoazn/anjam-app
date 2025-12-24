import { digitsEnToFa } from "@persian-tools/persian-tools";
import { Loader2, Plus, Users as UsersIcon } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { DeleteUserDialog } from "@/components/user/delete-user-dialog";
import { UserListTable } from "@/components/user/user-list-table";
import { users as usersText } from "@/constants";
import { UsersResponse, UsersRoleOptions } from "@/lib/pocketbase-types";
import { useUsers } from "@/hooks";
import { useAuthUser } from "@/store/auth-store";

export default function Users() {
  const navigate = useNavigate();
  const authUser = useAuthUser();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsersResponse | null>(null);

  const {
    data: usersData,
    isPending: isLoadingUsers,
    refetch,
  } = useUsers({
    batch: 100,
    sort: "-created",
  });

  const isAdmin = authUser?.role === UsersRoleOptions.admin;
  const isManager = authUser?.role === UsersRoleOptions.manager;
  const isSupervisor = authUser?.role === UsersRoleOptions.supervisor;
  const canViewPage = isAdmin || isSupervisor || isManager;
  const canCreateUsers = isAdmin || isManager; // Only admin and managers can create users

  const handleEdit = (userToEdit: UsersResponse) => {
    // Allow admins to edit any user, and users to edit themselves
    if (!isAdmin && userToEdit.id !== authUser?.id) return;
    navigate(`/users/${userToEdit.id}/edit`);
  };

  const handleDelete = (user: UsersResponse) => {
    if (!isAdmin) return;
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  // Redirect non-admin and non-supervisor users
  if (!canViewPage) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PageTransition className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
              <UsersIcon className="h-5 w-5 md:h-6 md:w-6" />
              {usersText.title}
            </h1>
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
              {usersText.list.count.replace(
                "{count}",
                digitsEnToFa(usersData?.length ?? 0).toString(),
              )}
            </span>
          </div>
          {canCreateUsers && (
            <Button
              onClick={() => navigate("/users/new")}
              className="w-full gap-2 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              {usersText.create.button}
            </Button>
          )}
        </div>
        {isLoadingUsers ? (
          <div className="flex h-full items-center justify-center py-12">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : (
          <UserListTable
            users={usersData ?? []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isAdmin={isAdmin}
            onUpdate={() => refetch()}
          />
        )}
      </PageTransition>

      <DeleteUserDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        user={selectedUser}
      />
    </>
  );
}
