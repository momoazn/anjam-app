import { queryKeys } from "@/hooks/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconLoader2,
  IconPlus,
  IconTrash,
  IconUsers,
  IconHash,
  IconX,
  IconTerminal,
} from "@tabler/icons-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { digitsEnToFa } from "@persian-tools/persian-tools";

import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { common, projects, users as usersText } from "@/constants";
import { useProjectUsers, useProjectWithSupervisor, useUsers } from "@/hooks";
import { pb } from "@/lib/pocketbase";
import { usePermissions } from "@/hooks/usePermissions";
import { formatUserName } from "@/lib/utils";
import { handlePocketBaseError } from "@/lib/error-handler";
import { UserAvatar } from "@/components/user-avatar";

export default function ProjectUsers() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { can } = usePermissions(id);
  const canManageUsers = can("project.manage_members");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const projectRoleLabels: Record<string, string> = {
    owner: "Owner",
    admin: "Admin",
    member: usersText.table.roles.employee,
    viewer: "Viewer",
  };

  const { data: project } = useProjectWithSupervisor({
    id: id as string,
  });
  const { data: projectUsers } = useProjectUsers({ projectId: id as string });

  const { data: allUsers } = useUsers({ enabled: canManageUsers });

  const { mutate: addUserToProject, isPending: isAddingUser } = useMutation({
    mutationFn: async (userId: string) => {
      return pb.collection("project_members").create({
        user: userId,
        project: id,
        role: "member",
        notifications: true,
        added_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.allProjectUsers(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      if (id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(id),
        });
      }
      setIsAddUserOpen(false);
      toast.success(projects.users.addSuccess);
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });

  const { mutate: removeUserFromProject, isPending: isRemovingUser } =
    useMutation({
      mutationFn: async (userId: string) => {
        const tasks = await pb.collection("tasks").getFullList({
          filter: `project = "${id}" && assignee = "${userId}"`,
        });

        await Promise.all(
          tasks.map((task) =>
            pb.collection("tasks").update(task.id, { assignee: "" }),
          ),
        );

        const records = await pb.collection("project_members").getFullList({
          filter: `user = "${userId}" && project = "${id}"`,
        });
        if (records.length > 0) {
          return pb.collection("project_members").delete(records[0].id);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.allProjectUsers(),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
        if (id) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.projects.detail(id),
          });
        }
        setIsRemoveDialogOpen(false);
        setUserToRemove(null);
        toast.success(projects.users.removeSuccess);
      },
      onError: (error) => {
        handlePocketBaseError(error);
      },
    });

  const availableUsers = allUsers?.filter(
    (u) => !projectUsers?.some((pu) => pu.id === u.id),
  );

  const headerActions = canManageUsers ? (
    <Button
      onClick={() => setIsAddUserOpen(true)}
      className="h-14 gap-3 rounded-none px-8 font-black shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 dark:shadow-[-4px_4px_0px_0px_rgba(255,255,255,0.1)]"
      size="lg"
    >
      <IconPlus className="size-5" />
      <span className="tracking-widest uppercase">{projects.users.add}</span>
    </Button>
  ) : null;

  return (
    <PageTransition className="container mx-auto max-w-5xl p-4 md:p-6">
      <PageHeader
        title={projects.users.title}
        description={
          projectUsers
            ? `${digitsEnToFa(projectUsers.length)} personnel nodes assigned to this sector`
            : "Project team assignment protocol"
        }
        icon={IconUsers}
        nodeId={`Project_Personnel :: ${project?.code || "???"}`}
        actions={headerActions}
      />

      <div
        className="bg-border/40 border-border/40 grid grid-cols-1 gap-px overflow-hidden border shadow-xl"
        data-animate-stagger
      >
        <div className="bg-muted/20 border-border/40 sticky top-0 z-10 grid h-10 grid-cols-12 border-b backdrop-blur-sm">
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
          {canManageUsers && (
            <div className="col-span-2 flex items-center justify-center px-4">
              <span className="text-[9px] font-black tracking-widest uppercase opacity-60">
                {projects.users.table.actions}
              </span>
            </div>
          )}
        </div>

        {project?.expand?.supervisor && (
          <div className="group bg-muted/5 relative grid grid-cols-12 overflow-hidden text-right">
            <div className="border-border/10 col-span-6 flex items-center justify-end gap-3 border-s px-6 py-4">
              <div className="flex flex-col items-end">
                <span className="mb-1 text-[11px] leading-none font-black tracking-tight uppercase">
                  {formatUserName(
                    project.expand.supervisor.first_name,
                    project.expand.supervisor.last_name,
                    project.expand.supervisor.username,
                  )}
                </span>
                <div className="flex items-center gap-1.5">
                  <IconHash className="size-2.5 opacity-20" />
                  <span className="font-mono text-[8px] font-black tracking-widest uppercase opacity-40">
                    {project.expand.supervisor.id.slice(0, 8)}
                  </span>
                </div>
              </div>
              <UserAvatar
                user={project.expand.supervisor}
                className="border-border/40 size-9 rounded-none border"
              />
            </div>
            <div className="border-border/10 col-span-4 flex items-center justify-end border-s px-6 py-4">
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/5 text-primary rounded-none text-[9px] font-black tracking-widest uppercase"
              >
                {usersText.table.roles.supervisor}
              </Badge>
            </div>
            {canManageUsers && <div className="col-span-2" />}
            <div className="bg-primary/10 absolute end-0 bottom-0 h-0.5 w-full" />
          </div>
        )}

        {projectUsers?.map((u) => (
          <div
            key={u.id}
            className="group bg-card hover:bg-muted/30 relative grid grid-cols-12 overflow-hidden text-right transition-all"
          >
            <div className="border-border/10 col-span-6 flex items-center justify-end gap-3 border-s px-6 py-4">
              <div className="flex flex-col items-end">
                <span className="mb-1 text-[11px] leading-none font-black tracking-tight uppercase">
                  {formatUserName(u.first_name, u.last_name, u.username)}
                </span>
                <div className="flex items-center gap-1.5">
                  <IconHash className="size-2.5 opacity-20" />
                  <span className="font-mono text-[8px] font-black tracking-widest uppercase opacity-40">
                    {u.id.slice(0, 8)}
                  </span>
                </div>
              </div>
              <UserAvatar
                user={u}
                className="border-border/40 size-9 rounded-none border"
              />
            </div>

            <div className="border-border/10 col-span-4 flex items-center justify-end border-s px-6 py-4">
              <Badge
                variant="outline"
                className="border-border/40 bg-muted/30 text-muted-foreground rounded-none text-[9px] font-black tracking-widest uppercase"
              >
                {projectRoleLabels[u.project_role ?? "member"] ??
                  usersText.table.roles.employee}
              </Badge>
            </div>

            {canManageUsers && (
              <div className="col-span-2 flex items-center justify-center px-4 py-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 translate-y-1 rounded-none text-rose-500 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 hover:bg-rose-500/10"
                  onClick={() => {
                    setUserToRemove({ id: u.id, username: u.username });
                    setIsRemoveDialogOpen(true);
                  }}
                  disabled={isRemovingUser}
                >
                  <IconTrash className="size-4" />
                </Button>
              </div>
            )}

            <div className="bg-primary absolute end-0 bottom-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full" />
          </div>
        ))}
      </div>

      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="border-foreground bg-card overflow-hidden rounded-none border-2 p-0 shadow-[-8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-muted/20 border-border/40 flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <IconTerminal className="text-primary size-4" />
              <DialogTitle className="text-sm font-black tracking-widest uppercase">
                {projects.users.addDialog.title}
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="opacity-40 transition-opacity hover:opacity-100"
            >
              <IconX className="size-4" />
            </button>
          </div>

          <div className="space-y-6 p-8 text-right">
            <div className="space-y-2">
              <span className="text-muted-foreground/60 text-[10px] font-black tracking-[0.2em] uppercase">
                {projects.users.addDialog.selectPlaceholder}
              </span>
              <Select
                onValueChange={(value) => {
                  addUserToProject(value);
                }}
                disabled={isAddingUser}
              >
                <SelectTrigger className="border-border/40 bg-muted/5 h-12 rounded-none border-2 text-right text-xs font-black tracking-widest uppercase focus:ring-0">
                  <SelectValue
                    placeholder={projects.users.addDialog.selectPlaceholder}
                  />
                </SelectTrigger>
                <SelectContent className="border-foreground bg-card rounded-none border-2">
                  {availableUsers && availableUsers.length > 0 ? (
                    availableUsers.map((u) => (
                      <SelectItem
                        key={u.id}
                        value={u.id}
                        className="text-right text-[10px] font-black uppercase"
                      >
                        {formatUserName(u.first_name, u.last_name, u.username)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem
                      value="__empty"
                      disabled
                      className="text-[10px] font-black uppercase"
                    >
                      {common.messages.noData}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {isAddingUser && (
              <div className="text-primary flex items-center justify-center gap-2 opacity-40">
                <IconLoader2 className="size-4 animate-spin" />
                <span className="text-[10px] font-black tracking-widest uppercase">
                  Executing_Provision...
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
      >
        <AlertDialogContent className="border-foreground rounded-none border-2 shadow-[-8px_8px_0px_0px_rgba(0,0,0,1)]">
          <AlertDialogHeader>
            <div className="mb-2 flex items-center gap-3 text-rose-500">
              <IconTrash className="size-5" />
              <AlertDialogTitle className="text-xl font-black tracking-tight uppercase">
                {projects.users.remove.title}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm font-bold opacity-70">
              {projects.users.remove.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="border-foreground rounded-none border-2 text-[10px] font-black tracking-widest uppercase">
              {common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                userToRemove && removeUserFromProject(userToRemove.id)
              }
              disabled={isRemovingUser}
              className="border-foreground rounded-none border-2 bg-rose-500 text-[10px] font-black tracking-widest text-white uppercase shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-600 active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none"
            >
              {isRemovingUser && (
                <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
              )}
              {common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
