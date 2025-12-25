import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

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
import { organization } from "@/constants";
import { pb } from "@/lib/pocketbase";
import { useCurrentOrganization, useAuthUser } from "@/store/auth-store";
import type {
  OrganizationMembersResponse,
  UsersResponse,
} from "@/lib/pocketbase-types";

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

interface OrgMemberWithUser extends OrganizationMembersResponse {
  expand?: {
    user?: UsersResponse;
  };
}

export function OrgMembersPage() {
  const currentOrg = useCurrentOrganization();
  const currentUser = useAuthUser();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<OrgMemberWithUser[]>([]);

  // Fetch members on mount
  const fetchMembers = useCallback(async () => {
    if (!currentOrg) return;
    try {
      const records = await pb
        .collection("organization_members")
        .getFullList<OrgMemberWithUser>({
          filter: `organization = "${currentOrg.id}"`,
          expand: "user",
          sort: "role,-created",
        });
      setMembers(records);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  }, [currentOrg]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async () => {
    if (!currentOrg || !currentUser) return;

    setIsLoading(true);
    try {
      // Find user by email
      let user: UsersResponse;
      try {
        user = await pb
          .collection("users")
          .getFirstListItem<UsersResponse>(`email = "${inviteEmail}"`);
      } catch {
        toast.error("کاربری با این ایمیل یافت نشد");
        setIsLoading(false);
        return;
      }

      // Check if already a member
      try {
        await pb
          .collection("organization_members")
          .getFirstListItem(
            `organization = "${currentOrg.id}" && user = "${user.id}"`,
          );
        toast.error("این کاربر قبلاً عضو سازمان است");
        setIsLoading(false);
        return;
      } catch {
        // User is not a member yet
      }

      // Create membership
      await pb.collection("organization_members").create({
        organization: currentOrg.id,
        user: user.id,
        role: inviteRole,
        status: "invited",
        invited_by: currentUser.id,
        invited_at: new Date().toISOString(),
      });

      toast.success(organization.members.inviteDialog.sendSuccess);
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      fetchMembers();
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error(organization.members.inviteDialog.sendError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await pb.collection("organization_members").delete(memberId);
      toast.success(organization.members.remove.success);
      fetchMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(organization.members.remove.error);
    }
  };

  if (!currentOrg) {
    return (
      <div className="container mx-auto py-12">
        <p className="text-muted-foreground text-center">سازمان یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-black tracking-tight">
            {organization.members.title}
          </h1>
        </div>
        <Button onClick={() => setIsInviteOpen(true)}>
          {organization.members.invite}
        </Button>
      </div>

      <div className="rounded-lg border">
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
            {members.length === 0 ? (
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
                              ({ username: "کاربر ناشناس" } as UsersResponse),
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
                        >
                          حذف
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{organization.members.inviteDialog.title}</DialogTitle>
            <DialogDescription>
              دعوت‌نامه‌ای به ایمیل وارد شده ارسال می‌شود
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
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
              <label className="text-sm font-medium">
                {organization.members.inviteDialog.role}
              </label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as "admin" | "member")}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      organization.members.inviteDialog.rolePlaceholder
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">ادمین</SelectItem>
                  <SelectItem value="member">عضو</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
              انصراف
            </Button>
            <Button onClick={handleInvite} disabled={isLoading || !inviteEmail}>
              {isLoading
                ? "در حال ارسال..."
                : organization.members.inviteDialog.send}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
