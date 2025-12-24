import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconPlus, IconUsers } from "@tabler/icons-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { DeleteUserDialog } from "@/components/user/delete-user-dialog";
import { UserListTable } from "@/components/user/user-list-table";
import { Button } from "@/components/ui/button";
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
    return <Navigate to="/" replace />;
  }

  const headerActions = canCreateUsers ? (
    <Button
      onClick={() => navigate("/users/new")}
      className="h-14 gap-3 rounded-none px-8 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
      size="lg"
    >
      <IconPlus className="size-5" />
      <span className="tracking-widest uppercase">
        {usersText.create.button}
      </span>
    </Button>
  ) : null;

  return (
    <>
      <PageTransition className="container mx-auto p-4 md:p-6">
        <PageHeader
          title={usersText.title}
          description={usersText.list.count.replace(
            "{count}",
            digitsEnToFa(usersData?.length ?? 0).toString(),
          )}
          icon={IconUsers}
          nodeId="Operator_Registry"
          actions={headerActions}
        />

        <div className="space-y-6">
          {isLoadingUsers ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <IconUsers className="text-primary size-12 animate-pulse opacity-20" />
              <h3 className="text-foreground mt-4 text-[10px] font-black tracking-[0.3em] uppercase opacity-40">
                Syncing_Operator_Index...
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
