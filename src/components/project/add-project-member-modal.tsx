import { useMemo, useState } from "react";
import { IconTerminal, IconX } from "@tabler/icons-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projects, common } from "@/constants";
import { useOrganizationMembers } from "@/hooks";
import { useAddProjectMember } from "@/hooks/project-members";
import { formatUserName } from "@/lib/utils";
import { ProjectRoleInfo } from "@/components/project/project-role-info";

const projectRoles = ["owner", "admin", "member", "viewer"] as const;

type ProjectRole = (typeof projectRoles)[number];

type AddProjectMemberModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  existingMemberUserIds: string[];
};

export function AddProjectMemberModal({
  open,
  onOpenChange,
  projectId,
  existingMemberUserIds,
}: AddProjectMemberModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<ProjectRole>("member");

  const { data: orgMembers, isLoading } = useOrganizationMembers({
    status: "active",
  });

  const { mutate: addMember, isPending } = useAddProjectMember();

  const availableUsers = useMemo(() => {
    return (
      orgMembers
        ?.map((member) => member.expand?.user)
        .filter((user): user is NonNullable<typeof user> => Boolean(user))
        .filter((user) => !existingMemberUserIds.includes(user.id)) ?? []
    );
  }, [orgMembers, existingMemberUserIds]);

  const handleSubmit = () => {
    if (!selectedUserId) return;

    addMember(
      { projectId, userId: selectedUserId, role: selectedRole },
      {
        onSuccess: () => {
          setSelectedUserId("");
          setSelectedRole("member");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card overflow-hidden rounded-2xl border p-0 shadow-sm">
        <div className="bg-muted/20 border-border/40 flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <IconTerminal className="text-primary size-4" />
            <DialogTitle className="text-sm font-bold tracking-tight">
              {projects.users.addDialog.title}
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="opacity-40 transition-opacity hover:opacity-100"
          >
            <IconX className="size-4" />
          </button>
        </div>

        <div className="space-y-6 p-8 text-right">
          <div className="space-y-2">
            <span className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
              {projects.users.addDialog.selectPlaceholder}
            </span>
            <Select
              onValueChange={setSelectedUserId}
              value={selectedUserId}
              disabled={isPending || isLoading}
            >
              <SelectTrigger className="border-border/40 bg-muted/5 h-12 rounded-xl border text-right text-xs font-bold tracking-tight focus:ring-0">
                <SelectValue
                  placeholder={projects.users.addDialog.selectPlaceholder}
                />
              </SelectTrigger>
              <SelectContent className="border-border bg-card rounded-xl border">
                {availableUsers.length > 0 ? (
                  availableUsers.map((user) => (
                    <SelectItem
                      key={user.id}
                      value={user.id}
                      className="text-right text-[10px] font-bold"
                    >
                      {formatUserName(
                        user.first_name,
                        user.last_name,
                        user.username,
                      )}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem
                    value="__empty"
                    disabled
                    className="text-[10px] font-bold"
                  >
                    {common.messages.noData}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
              {projects.users.table.role}
            </span>
            <Select
              onValueChange={(value) => setSelectedRole(value as ProjectRole)}
              value={selectedRole}
              disabled={isPending}
            >
              <SelectTrigger className="border-border/40 bg-muted/5 h-12 rounded-xl border text-right text-xs font-bold tracking-tight focus:ring-0">
                <SelectValue placeholder={projects.users.table.role} />
              </SelectTrigger>
              <SelectContent className="border-border bg-card rounded-xl border">
                {projectRoles.map((role) => (
                  <SelectItem
                    key={role}
                    value={role}
                    className="text-right text-[10px] font-bold"
                  >
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <span className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
              Role Matrix
            </span>
            <div className="space-y-2">
              {projectRoles.map((role) => (
                <ProjectRoleInfo key={role} role={role} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              {common.cancel}
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              onClick={handleSubmit}
              disabled={!selectedUserId || isPending}
            >
              {projects.users.add}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
