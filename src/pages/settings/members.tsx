import { useState } from "react";

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
import { useAuthUser } from "@/store/auth-store";
import {
  useOrganizationMembers,
  useInviteOrgMember,
  useRemoveOrgMember,
} from "@/hooks";
import type { UsersResponse } from "@/lib/pocketbase-types";

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
            {isLoadingMembers ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  در حال بارگذاری...
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
                          disabled={isRemoving}
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
            <Button
              onClick={handleInvite}
              disabled={isInviting || !inviteEmail}
            >
              {isInviting
                ? "در حال ارسال..."
                : organization.members.inviteDialog.send}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
