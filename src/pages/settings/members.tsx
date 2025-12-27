import { useState } from "react";
import {
  IconUsers,
  IconUserPlus,
  IconTrash,
  IconMail,
  IconCalendar,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { organization, shared } from "@/constants";
import { pb } from "@/lib/pocketbase";
import { useAuthUser } from "@/store/auth-store";
import {
  useOrganizationMembers,
  useInviteOrgMember,
  useRemoveOrgMember,
} from "@/hooks";
import type { UsersResponse } from "@/lib/pocketbase-types";
import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { cn } from "@/lib/utils";

function getUserInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getUserDisplayName(user: UsersResponse): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  if (user.first_name) {
    return user.first_name;
  }
  return user.username;
}

export function OrgMembersPage() {
  const currentUser = useAuthUser();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");

  const { data: members, isLoading: isLoadingMembers } =
    useOrganizationMembers();
  const { mutate: inviteMember, isPending: isInviting } = useInviteOrgMember();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveOrgMember();

  const handleInvite = () => {
    inviteMember(
      { email: inviteEmail, role: inviteRole },
      {
        onSuccess: () => {
          setIsInviteOpen(false);
          setInviteEmail("");
          setInviteRole("member");
        },
      },
    );
  };

  const handleRemoveMember = (memberId: string) => {
    removeMember(memberId);
  };

  return (
    <PageTransition className="container mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={organization.members.title}
          description="Manage your organization members and their roles"
          icon={IconUsers}
        />
        <Button onClick={() => setIsInviteOpen(true)} className="h-11 px-6">
          <IconUserPlus className="me-2 size-5" />
          {organization.members.invite}
        </Button>
      </div>

      <div className="border-border bg-card relative overflow-hidden rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                {organization.members.table.user}
              </TableHead>
              <TableHead>{organization.members.table.email}</TableHead>
              <TableHead>{organization.members.table.role}</TableHead>
              <TableHead>{organization.members.table.status}</TableHead>
              <TableHead>{organization.members.table.joined}</TableHead>
              <TableHead className="text-left">
                {organization.members.table.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingMembers ? (
              <TableRow>
                <TableCell colSpan={6} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
                    <p className="text-muted-foreground text-sm font-medium">
                      {organization.members.loading}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : !members || members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <IconUsers
                      className="text-muted-foreground/20 size-12"
                      stroke={1.5}
                    />
                    <p className="text-muted-foreground text-sm font-medium">
                      {organization.members.empty}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const user = member.expand?.user;
                return (
                  <TableRow key={member.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="border-border h-10 w-10 rounded-full border shadow-sm">
                            <AvatarImage
                              src={
                                user?.avatar
                                  ? pb.files.getURL(user, user.avatar)
                                  : undefined
                              }
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {getUserInitials(
                                getUserDisplayName(
                                  user ?? ({ username: "?" } as UsersResponse),
                                ),
                              )}
                            </AvatarFallback>
                          </Avatar>
                          {member.status === "active" && (
                            <div className="bg-primary border-background absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold tracking-tight">
                            {getUserDisplayName(
                              user ??
                                ({
                                  username: organization.members.unknownUser,
                                } as UsersResponse),
                            )}
                          </span>
                          <span className="text-muted-foreground text-[10px] font-medium">
                            ID: {member.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                        <IconMail className="size-3.5" />
                        {user?.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-semibold">
                          {member.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "font-semibold",
                          member.status === "active"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-muted text-muted-foreground border-border",
                        )}
                      >
                        {member.status === "active"
                          ? organization.members.status.active
                          : organization.members.status.invited}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-medium">
                        <IconCalendar className="size-3.5" />
                        {member.joined_at
                          ? new Date(member.joined_at).toLocaleDateString(
                              "fa-IR",
                            )
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-left">
                      {member.user !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={isRemoving}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-3 text-xs font-semibold"
                        >
                          <IconTrash className="me-1.5 size-3.5" />
                          {shared.delete}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="border-border max-w-md overflow-hidden rounded-lg border p-0 shadow-lg">
          <div className="bg-primary/5 border-border border-b px-6 py-6">
            <DialogHeader className="text-right">
              <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <IconUserPlus className="size-7" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {organization.members.inviteDialog.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm font-medium">
                {organization.members.inviteDialog.description}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-6 p-6 text-right">
            <div className="space-y-2">
              <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {organization.members.inviteDialog.email}
              </label>
              <Input
                placeholder={organization.members.inviteDialog.emailPlaceholder}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                type="email"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {organization.members.inviteDialog.role}
              </label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as "admin" | "member")}
              >
                <SelectTrigger className="h-11 text-right">
                  <SelectValue
                    placeholder={
                      organization.members.inviteDialog.rolePlaceholder
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin" className="text-right">
                    {organization.members.roles.admin}
                  </SelectItem>
                  <SelectItem value="member" className="text-right">
                    {organization.members.roles.member}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted/30 border-border flex flex-row-reverse gap-3 border-t p-6">
            <Button
              onClick={handleInvite}
              disabled={isInviting || !inviteEmail}
              className="h-11 flex-1"
            >
              {isInviting
                ? organization.members.sending
                : organization.members.inviteDialog.send}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsInviteOpen(false)}
              className="h-11 flex-1"
            >
              {shared.cancel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
