import { useMemo, useState } from "react";
import {
  IconLoader2,
  IconTrash,
  IconUsers,
  IconHash,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { projects, common } from "@/constants";
import {
  useProjectMembers,
  useUpdateProjectMemberRole,
  useRemoveProjectMember,
} from "@/hooks/project-members";
import { usePermissions } from "@/hooks/usePermissions";
import { formatUserName } from "@/lib/utils";
import { pb } from "@/lib/pocketbase";
import { UserAvatar } from "@/components/user-avatar";
import { AddProjectMemberModal } from "@/components/project/add-project-member-modal";

const projectRoles = ["owner", "admin", "member", "viewer"] as const;

type ProjectRole = (typeof projectRoles)[number];

type ProjectMembersProps = {
  projectId: string;
};

type MemberToRemove = {
  memberId: string;
  userId: string;
  userName: string;
} | null;

export function ProjectMembersSection({ projectId }: ProjectMembersProps) {
  const { can } = usePermissions(projectId);
  const canManageMembers = can("project.manage_members");
  const { data: members } = useProjectMembers(projectId);
  const { mutate: updateRole, isPending: isUpdatingRole } =
    useUpdateProjectMemberRole();
  const { mutate: removeMember, isPending: isRemoving } =
    useRemoveProjectMember();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<MemberToRemove>(null);

  const existingMemberUserIds = useMemo(() => {
    return members?.map((member) => member.user) ?? [];
  }, [members]);

  const handleRoleChange = (memberId: string, role: ProjectRole) => {
    updateRole({ memberId, role });
  };

  const confirmRemove = async () => {
    if (!memberToRemove) return;

    await pb
      .collection("tasks")
      .getFullList({
        filter: `project = "${projectId}" && assignee = "${memberToRemove.userId}"`,
      })
      .then((tasks) =>
        Promise.all(
          tasks.map((task) =>
            pb.collection("tasks").update(task.id, { assignee: "" }),
          ),
        ),
      );

    removeMember(memberToRemove.memberId, {
      onSuccess: () => {
        setMemberToRemove(null);
      },
    });
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <IconUsers className="text-primary size-4" />
          <span className="text-muted-foreground text-[10px] font-black tracking-[0.3em] uppercase">
            Project_Members
          </span>
        </div>
        {canManageMembers && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="h-10 rounded-none px-6 text-[10px] font-black tracking-widest uppercase"
          >
            {projects.users.add}
          </Button>
        )}
      </div>

      <div
        className="bg-border/40 border-border/40 grid grid-cols-1 gap-px overflow-hidden border"
        data-animate-stagger
      >
        <div className="bg-muted/20 border-border/40 grid h-10 grid-cols-12 border-b">
          <div className="border-border/10 col-span-6 flex items-center justify-end border-s px-6">
            <span className="text-[9px] font-black tracking-widest uppercase opacity-60">
              {projects.users.table.user}
            </span>
          </div>
          <div className="border-border/10 col-span-4 flex items-center justify-end border-s px-6">
            <span className="text-[9px] font-black tracking-widest uppercase opacity-60">
              {projects.users.table.role}
            </span>
          </div>
          {canManageMembers && (
            <div className="col-span-2 flex items-center justify-center px-4">
              <span className="text-[9px] font-black tracking-widest uppercase opacity-60">
                {projects.users.table.actions}
              </span>
            </div>
          )}
        </div>

        {members?.map((member) => {
          const user = member.expand?.user;
          if (!user) return null;

          return (
            <div
              key={member.id}
              className="group bg-card hover:bg-muted/30 relative grid grid-cols-12 overflow-hidden text-right transition-all"
            >
              <div className="border-border/10 col-span-6 flex items-center justify-end gap-3 border-s px-6 py-4">
                <div className="flex flex-col items-end">
                  <span className="mb-1 text-[11px] leading-none font-black tracking-tight uppercase">
                    {formatUserName(
                      user.first_name,
                      user.last_name,
                      user.username,
                    )}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <IconHash className="size-2.5 opacity-20" />
                    <span className="font-mono text-[8px] font-black tracking-widest uppercase opacity-40">
                      {user.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
                <UserAvatar
                  user={user}
                  className="border-border/40 size-9 rounded-none border"
                />
              </div>

              <div className="border-border/10 col-span-4 flex items-center justify-end border-s px-6 py-4">
                {canManageMembers ? (
                  <Select
                    value={member.role}
                    onValueChange={(value) =>
                      handleRoleChange(member.id, value as ProjectRole)
                    }
                    disabled={isUpdatingRole}
                  >
                    <SelectTrigger className="border-border/40 bg-muted/5 h-10 w-full rounded-none border text-right text-[9px] font-black tracking-widest uppercase focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-foreground bg-card rounded-none border-2">
                      {projectRoles.map((role) => (
                        <SelectItem
                          key={role}
                          value={role}
                          className="text-right text-[9px] font-black uppercase"
                        >
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-border/40 bg-muted/30 text-muted-foreground rounded-none text-[9px] font-black tracking-widest uppercase"
                  >
                    {member.role}
                  </Badge>
                )}
              </div>

              {canManageMembers && (
                <div className="col-span-2 flex items-center justify-center px-4 py-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 translate-y-1 rounded-none text-rose-500 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 hover:bg-rose-500/10"
                    onClick={() =>
                      setMemberToRemove({
                        memberId: member.id,
                        userId: user.id,
                        userName: formatUserName(
                          user.first_name,
                          user.last_name,
                          user.username,
                        ),
                      })
                    }
                    disabled={isRemoving}
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              )}

              <div className="bg-primary absolute end-0 bottom-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full" />
            </div>
          );
        })}
      </div>

      <AddProjectMemberModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        projectId={projectId}
        existingMemberUserIds={existingMemberUserIds}
      />

      <AlertDialog
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent className="border-foreground rounded-none border-2 shadow-[-8px_8px_0px_0px_rgba(0,0,0,1)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black tracking-tight uppercase">
              {projects.users.remove.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-bold opacity-70">
              {projects.users.remove.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="border-foreground rounded-none border-2 text-[10px] font-black tracking-widest uppercase">
              {common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              disabled={isRemoving}
              className="border-foreground rounded-none border-2 bg-rose-500 text-[10px] font-black tracking-widest text-white uppercase shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-600 active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none"
            >
              {isRemoving && (
                <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
              )}
              {common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
