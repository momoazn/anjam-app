import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconPlus, IconUsers } from "@tabler/icons-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { DeleteUserDialog } from "@/components/user/delete-user-dialog";
import { UserListTable } from "@/components/user/user-list-table";
import { users as usersText } from "@/constants";
import { useUsers } from "@/hooks";
import { UsersResponse, UsersRoleOptions } from "@/lib/pocketbase-types";
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
  const canCreateUsers = isAdmin || isManager;

  const handleEdit = (userToEdit: UsersResponse) => {
    if (!isAdmin && userToEdit.id !== authUser?.id) return;
    navigate(`/users/${userToEdit.id}/edit`);
  };

  const handleDelete = (user: UsersResponse) => {
    if (!isAdmin) return;
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  if (!canViewPage) {
    return <Navigate to="/dashboard" replace />;
  }

  const headerActions = canCreateUsers ? (
    <Button
      className="h-10 gap-2 rounded-xl px-5 text-sm font-bold shadow-sm transition-all hover:scale-[1.02]"
      onClick={() => navigate("/users/new")}
    >
      <IconPlus className="size-4.5" />
      <span>{usersText.create.button}</span>
    </Button>
  ) : null;

  return (
    <>
      <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
        <PageHeader
          title={usersText.title}
          subtitle={usersText.list.count.replace(
            "{count}",
            digitsEnToFa(usersData?.length ?? 0).toString(),
          )}
          icon={IconUsers}
          actions={headerActions}
        />

        <div className="space-y-6">
          {isLoadingUsers ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
              <h3 className="text-muted-foreground mt-4 text-sm font-medium">
                {usersText.list.loading}
              </h3>
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
        </div>
      </PageTransition>

      <DeleteUserDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        user={selectedUser}
      />
    </>
  );
}
