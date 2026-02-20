import {
  IconCheck,
  IconCopy,
  IconLink,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconBox } from "@/components/ui/icon-box";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { organization, shared } from "@/constants";
import {
  getInviteStatus,
  getInviteUrl,
  useCreateOrgInvite,
  useInviteOrgMember,
  useOrganizationInvites,
  useOrganizationMembers,
  useRemoveOrgMember,
  useRevokeOrgInvite,
} from "@/hooks/organization-members";
import type { Id } from "@/lib/convex";
import { getUserInitials } from "@/lib/utils";
import { useAuthUser } from "@/store/app-context-store";

import type { Doc } from "../../../convex/_generated/dataModel";

function getUserDisplayName(user: Doc<"users"> | null | undefined): string {
  if (!user) return organization.members.unknownUser;
  return user.displayName || user.email || "Unknown User";
}

export function OrgMembersPage() {
  const currentUser = useAuthUser();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateLinkOpen, setIsCreateLinkOpen] = useState(false);
  const [isRevokeConfirmOpen, setIsRevokeConfirmOpen] = useState(false);
  const [inviteToRevoke, setInviteToRevoke] = useState<Id<"invites"> | null>(
    null,
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"owner" | "member">("member");
  const [linkRole, setLinkRole] = useState<"owner" | "member">("member");
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

  const handleInvite = async () => {
    try {
      await inviteMember({ email: inviteEmail, role: inviteRole });
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
    } catch {
      toast.error("Failed to invite member");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember(userId);
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleCreateInviteLink = async () => {
    try {
      await createInviteLink({
        role: linkRole,
        maxUses: linkMaxUses,
      });
      setIsCreateLinkOpen(false);
      setLinkRole("member");
      setLinkMaxUses(50);
      toast.success(organization.inviteLinks.createDialog.success);
    } catch {
      toast.error("Failed to create invite link");
    }
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

  const handleRevokeClick = (inviteId: Id<"invites">) => {
    setInviteToRevoke(inviteId);
    setIsRevokeConfirmOpen(true);
  };

  const handleConfirmRevoke = async () => {
    if (inviteToRevoke) {
      try {
        await revokeInvite(inviteToRevoke);
        setIsRevokeConfirmOpen(false);
        setInviteToRevoke(null);
      } catch {
        toast.error("Failed to revoke invite");
      }
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
    <PageTransition
      data-testid="org-members-page"
      className="container mx-auto max-w-7xl p-4 md:p-6"
    >
      <PageHeader
        title={organization.members.title}
        subtitle="Manage your organization members and their roles"
        icon={IconUsers}
        actions={
          <Button
            onClick={() => setIsInviteOpen(true)}
            size="xs"
            className="gap-2"
          >
            <IconUserPlus className="me-2 size-4" />
            {organization.members.invite}
          </Button>
        }
      />

      <div className="relative overflow-hidden rounded-xl border border-border/40 bg-background/30 shadow-none">
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
                const user = member.user;
                return (
                  <TableRow key={member._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.image || undefined} />
                          <AvatarFallback>
                            {getUserInitials(getUserDisplayName(user))}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {getUserDisplayName(user)}
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
                      {member.joinedAt
                        ? new Date(member.joinedAt).toLocaleDateString("fa-IR")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {member.userId !== currentUser?._id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.userId)}
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
                    <TableRow key={invite._id}>
                      <TableCell className="font-mono text-sm">
                        <Link
                          to={`/invite/${invite.token}`}
                          className="hover:underline"
                          title={invite.token}
                        >
                          {invite.token.slice(0, 12)}...
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {organization.members.roles[
                            invite.role as keyof typeof organization.members.roles
                          ] || organization.members.roles.member}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invite.uses}/{invite.maxUses || "∞"}
                      </TableCell>
                      <TableCell>
                        {invite.expiresAt
                          ? new Date(invite.expiresAt).toLocaleDateString(
                              "fa-IR",
                            )
                          : "-"}
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
                              onClick={() => handleRevokeClick(invite._id)}
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
        <DialogContent className="border-border max-w-md overflow-hidden rounded-2xl border p-0 shadow-lg">
          <div className="bg-primary/5 border-border border-b px-6 py-6">
            <DialogHeader className="text-right">
              <IconBox size="sm" tone="primary" className="mb-4">
                <IconUserPlus className="size-7" />
              </IconBox>
              <DialogTitle className="text-lg font-bold tracking-tight">
                {organization.members.inviteDialog.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm font-medium">
                {organization.members.inviteDialog.description}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-6 p-6 text-right">
            <div className="space-y-2">
              <label className="text-muted-foreground text-xs font-semibold tracking-wider">
                {organization.members.inviteDialog.email}
              </label>
              <Input
                placeholder={organization.members.inviteDialog.emailPlaceholder}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                type="email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground text-xs font-semibold tracking-wider">
                {organization.members.inviteDialog.role}
              </label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as "owner" | "member")}
              >
                <SelectTrigger className="text-right">
                  <SelectValue
                    placeholder={
                      organization.members.inviteDialog.rolePlaceholder
                    }
                  />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="owner" className="text-right">
                    {organization.members.roles.owner}
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
              size="sm"
              className="flex-1"
            >
              {isInviting
                ? organization.members.sending
                : organization.members.inviteDialog.send}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsInviteOpen(false)}
              size="sm"
              className="flex-1"
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
                onValueChange={(v) => setLinkRole(v as "owner" | "member")}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      organization.inviteLinks.createDialog.rolePlaceholder
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">
                    {organization.members.roles.owner}
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
              size="sm"
              className="flex-1"
            >
              {shared.cancel}
            </Button>
            <Button
              onClick={handleCreateInviteLink}
              disabled={isCreatingLink}
              size="sm"
              className="flex-1"
            >
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
