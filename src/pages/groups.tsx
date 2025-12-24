import {
  IconPlus,
  IconBuildingCommunity,
  IconActivity,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { DeleteGroupDialog } from "@/components/group/delete-group-dialog";
import { GroupListCard } from "@/components/group/group-list-card";
import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { groups as groupsText } from "@/constants";
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

  const { data: groupsData, isPending: isLoadingGroups } = useGroups();
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

  const headerActions = isAdmin ? (
    <Button
      onClick={() => navigate("/groups/new")}
      className="h-14 gap-3 rounded-none px-8 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
      size="lg"
    >
      <IconPlus className="size-5" />
      <span className="tracking-widest uppercase">
        {groupsText.create.button}
      </span>
    </Button>
  ) : null;

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      <PageHeader
        title={groupsText.title}
        description={groupsText.list.count.replace(
          "{count}",
          digitsEnToFa(groupsData?.length ?? 0).toString(),
        )}
        icon={IconBuildingCommunity}
        nodeId="Organization_Registry"
        actions={headerActions}
      />

      {isLoadingGroups ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <IconBuildingCommunity className="text-primary size-12 animate-pulse opacity-20" />
          <h3 className="text-foreground mt-4 text-[10px] font-black tracking-[0.3em] uppercase opacity-40">
            Syncing_Group_Catalog...
          </h3>
        </div>
      ) : groupsData && groupsData.length > 0 ? (
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          data-animate-stagger
        >
          {groupsData.map((group) => (
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
        <div className="border-border/40 flex flex-col items-center justify-center border-2 border-dashed py-24 text-center opacity-30 grayscale">
          <IconActivity className="mb-4 size-10 stroke-[1]" />
          <p className="text-[10px] font-black tracking-[0.3em] uppercase">
            {groupsText.list.empty}
          </p>
        </div>
      )}

      <DeleteGroupDialog
        open={!!deleteGroupId}
        onOpenChange={(open) => !open && setDeleteGroupId(null)}
        group={groupsData?.find((g) => g.id === deleteGroupId) || null}
      />
    </PageTransition>
  );
}
