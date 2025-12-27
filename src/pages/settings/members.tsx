import { useState } from "react";
import {
  IconCheck,
  IconCopy,
  IconLink,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { PageTransition } from "@/components/page-transition";
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
  DialogFooter,
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
import {
  useOrganizationInvites,
  useCreateOrgInvite,
  useRevokeOrgInvite,
  getInviteStatus,
  getInviteUrl,
} from "@/hooks/organization-invites";
import type { UsersResponse } from "@/lib/pocketbase-types";
import { PageHeader } from "@/components/page-header";
import { IconBox } from "@/components/recipes/icon-box";
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
  const [isCreateLinkOpen, setIsCreateLinkOpen] = useState(false);
  const [isRevokeConfirmOpen, setIsRevokeConfirmOpen] = useState(false);
  const [inviteToRevoke, setInviteToRevoke] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [linkRole, setLinkRole] = useState<"admin" | "member">("member");
  const [linkMaxUses, setLinkMaxUses] = useState(50);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const { data: members, isLoading: isLoadingMembers } =
    useOrganizationMembers();
  const { mutate: inviteMember, isPending: isInviting } = useInviteOrgMember();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveOrgMember();

  // Invite links
  const { data: inviteLinks, isLoading: isLoadingInvites } =
    useOrganizationInvites();
  const { mutate: createInviteLink, isPending: isCreatingLink } =
    useCreateOrgInvite();
  const { mutate: revokeInvite, isPending: isRevoking } = useRevokeOrgInvite();

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

  const handleCreateInviteLink = () => {
    createInviteLink(
      { role: linkRole, maxUses: linkMaxUses },
      {
        onSuccess: () => {
          setIsCreateLinkOpen(false);
          setLinkRole("member");
          setLinkMaxUses(50);
        },
      },
    );
  };

  const handleCopyLink = async (token: string) => {
    try {
      await navigator.clipboard.writeText(getInviteUrl(token));
      setCopiedToken(token);
      toast.success(organization.inviteLinks.copied);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleRevokeClick = (inviteId: string) => {
    setInviteToRevoke(inviteId);
    setIsRevokeConfirmOpen(true);
  };

  const handleConfirmRevoke = () => {
    if (inviteToRevoke) {
      revokeInvite(inviteToRevoke, {
        onSuccess: () => {
          setIsRevokeConfirmOpen(false);
          setInviteToRevoke(null);
        },
      });
    }
  };

  const getStatusBadgeVariant = (
    status: "active" | "expired" | "exhausted" | "revoked",
  ) => {
    switch (status) {
      case "active":
        return "default";
      case "expired":
      case "exhausted":
        return "secondary";
      case "revoked":
        return "destructive";
    }
  };

  return (
    <PageTransition className="container mx-auto max-w-6xl p-4 md:p-[var(--ds-spacing-cardPadding)]">
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

      <div className="border-border bg-card relative overflow-hidden rounded-[var(--ds-radius-card)] border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{organization.members.table.user}</TableHead>
              <TableHead>{organization.members.table.email}</TableHead>
              <TableHead>{organization.members.table.role}</TableHead>
              <TableHead>{organization.members.table.status}</TableHead>
              <TableHead>{organization.members.table.joined}</TableHead>
              <TableHead className="text-right">
                {organization.members.table.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingMembers ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  {organization.members.loading}
                </TableCell>
              </TableRow>
            ) : !members || members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  {organization.members.empty}
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const user = member.expand?.user;
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              user?.avatar
                                ? pb.files.getURL(user, user.avatar)
                                : undefined
                            }
                          />
                          <AvatarFallback>
                            {getUserInitials(
                              getUserDisplayName(
                                user ?? ({ username: "?" } as UsersResponse),
                              ),
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {getUserDisplayName(
                            user ??
                              ({
                                username: organization.members.unknownUser,
                              } as UsersResponse),
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{user?.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === "active" ? "default" : "secondary"
                        }
                      >
                        {member.status === "active"
                          ? organization.members.status.active
                          : organization.members.status.invited}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.joined_at
                        ? new Date(member.joined_at).toLocaleDateString("fa-IR")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {member.user !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={isRemoving}
                        >
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

      {/* Invite Links Section */}
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {organization.inviteLinks.title}
          </h2>
          <Button onClick={() => setIsCreateLinkOpen(true)}>
            <IconLink className="me-2 size-4" />
            {organization.inviteLinks.create}
          </Button>
        </div>

        <div className="rounded-none border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{organization.inviteLinks.table.link}</TableHead>
                <TableHead>{organization.inviteLinks.table.role}</TableHead>
                <TableHead>{organization.inviteLinks.table.uses}</TableHead>
                <TableHead>{organization.inviteLinks.table.expiry}</TableHead>
                <TableHead>{organization.inviteLinks.table.status}</TableHead>
                <TableHead className="text-right">
                  {organization.inviteLinks.table.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingInvites ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center">
                    {organization.members.loading}
                  </TableCell>
                </TableRow>
              ) : !inviteLinks || inviteLinks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center">
                    {organization.inviteLinks.empty}
                  </TableCell>
                </TableRow>
              ) : (
                inviteLinks.map((invite) => {
                  const status = getInviteStatus(invite);
                  return (
                    <TableRow key={invite.id}>
                      <TableCell className="font-mono text-sm">
                        {invite.token.slice(0, 12)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {invite.role === "admin"
                            ? organization.members.roles.admin
                            : organization.members.roles.member}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invite.uses_count}/{invite.max_uses || "∞"}
                      </TableCell>
                      <TableCell>
                        {new Date(invite.expires_at).toLocaleDateString(
                          "fa-IR",
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(status)}>
                          {organization.inviteLinks.status[status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(invite.token)}
                            disabled={status !== "active"}
                          >
                            {copiedToken === invite.token ? (
                              <IconCheck className="size-4" />
                            ) : (
                              <IconCopy className="size-4" />
                            )}
                          </Button>
                          {status === "active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokeClick(invite.id)}
                              disabled={isRevoking}
                            >
                              {organization.inviteLinks.revoke}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="border-border max-w-md overflow-hidden rounded-[var(--ds-radius-card)] border p-0 shadow-lg">
          <div className="bg-primary/5 border-border border-b px-6 py-6">
            <DialogHeader className="text-right">
              <IconBox
                size="sm"
                tone="primary"
                className="mb-4"
                radius="var(--radius-xl)"
              >
                <IconUserPlus className="size-7" />
              </IconBox>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {organization.members.inviteDialog.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm font-medium">
                {organization.members.inviteDialog.description}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-6 p-[var(--ds-spacing-cardPadding)] text-right">
            <div className="space-y-2">
              <label className="text-muted-foreground text-xs font-semibold tracking-wider">
                {organization.members.inviteDialog.email}
              </label>
              <Input
                placeholder={organization.members.inviteDialog.emailPlaceholder}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                type="email"
                className="h-11 rounded-[var(--ds-radius-button)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground text-xs font-semibold tracking-wider">
                {organization.members.inviteDialog.role}
              </label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as "admin" | "member")}
              >
                <SelectTrigger className="h-11 rounded-[var(--ds-radius-button)] text-right">
                  <SelectValue
                    placeholder={
                      organization.members.inviteDialog.rolePlaceholder
                    }
                  />
                </SelectTrigger>
                <SelectContent className="rounded-[var(--ds-radius-button)]">
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
          <div className="bg-muted/30 border-border flex flex-row-reverse gap-3 border-t p-[var(--ds-spacing-cardPadding)]">
            <Button
              onClick={handleInvite}
              disabled={isInviting || !inviteEmail}
              className="h-11 flex-1 rounded-[var(--ds-radius-button)]"
            >
              {isInviting
                ? organization.members.sending
                : organization.members.inviteDialog.send}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsInviteOpen(false)}
              className="h-11 flex-1 rounded-[var(--ds-radius-button)]"
            >
              {shared.cancel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Invite Link Dialog */}
      <Dialog open={isCreateLinkOpen} onOpenChange={setIsCreateLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {organization.inviteLinks.createDialog.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {organization.inviteLinks.createDialog.role}
              </label>
              <Select
                value={linkRole}
                onValueChange={(v) => setLinkRole(v as "admin" | "member")}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      organization.inviteLinks.createDialog.rolePlaceholder
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    {organization.members.roles.admin}
                  </SelectItem>
                  <SelectItem value="member">
                    {organization.members.roles.member}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {organization.inviteLinks.createDialog.maxUses}
              </label>
              <Input
                type="number"
                min={1}
                value={linkMaxUses}
                onChange={(e) => setLinkMaxUses(parseInt(e.target.value) || 50)}
                placeholder={
                  organization.inviteLinks.createDialog.maxUsesPlaceholder
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateLinkOpen(false)}
              className="h-11 flex-1 rounded-[var(--ds-radius-button)]"
            >
              {shared.cancel}
            </Button>
            <Button onClick={handleCreateInviteLink} disabled={isCreatingLink}>
              {isCreatingLink
                ? organization.members.loading
                : organization.inviteLinks.createDialog.submit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={isRevokeConfirmOpen} onOpenChange={setIsRevokeConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {organization.inviteLinks.revokeDialog.title}
            </DialogTitle>
            <DialogDescription>
              {organization.inviteLinks.revokeDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRevokeConfirmOpen(false)}
            >
              {shared.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRevoke}
              disabled={isRevoking}
            >
              {isRevoking
                ? organization.members.loading
                : organization.inviteLinks.revokeDialog.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
