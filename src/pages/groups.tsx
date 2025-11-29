import { Loader2, Plus, Building2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { DeleteGroupDialog } from "@/components/group/delete-group-dialog";
import { GroupListCard } from "@/components/group/group-list-card";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { fa } from "@/constants/text";
import {
  UsersRoleOptions,
  GroupsResponse,
  UsersResponse,
} from "@/lib/pocketbase-types";
import { useGroups, useToggleGroupActive } from "@/hooks";
import { useAuthUser } from "@/store/auth-store";
import { digitsEnToFa } from "@persian-tools/persian-tools";

export default function Groups() {
  const user = useAuthUser();
  const navigate = useNavigate();
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);

  const { data: groups, isPending: isLoadingGroups } = useGroups();
  const toggleGroupActiveMutation = useToggleGroupActive();

  const handleEdit = (groupId: string) => {
    navigate(`/groups/${groupId}/edit`);
  };

  const handleDelete = (groupId: string) => {
    setDeleteGroupId(groupId);
  };

  const handleToggleActive = (groupId: string) => {
    toggleGroupActiveMutation.mutate(groupId);
  };

  const isAdmin = user?.role === UsersRoleOptions.admin;

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <Building2 className="h-5 w-5 md:h-6 md:w-6" />
            {fa.groups.title}
          </h1>
          <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
            {fa.groups.list.count.replace(
              "{count}",
              digitsEnToFa(groups?.length ?? 0).toString(),
            )}
          </span>
        </div>
        {isAdmin && (
          <Button
            onClick={() => navigate("/groups/new")}
            className="w-full gap-2 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {fa.groups.create.button}
          </Button>
        )}
      </div>

      {isLoadingGroups ? (
        <div className="flex h-full items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : groups && groups.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupListCard
              key={group.id}
              group={group as GroupsResponse<{ manager: UsersResponse }>}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            {fa.groups.list.empty}
          </p>
        </div>
      )}

      <DeleteGroupDialog
        open={!!deleteGroupId}
        onOpenChange={(open) => !open && setDeleteGroupId(null)}
        group={groups?.find((g) => g.id === deleteGroupId) || null}
      />
    </PageTransition>
  );
}
