import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
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
  useOrganizationMembers,
  useRemoveOrgMember,
} from "@/hooks/organization-members";
import { getUserInitials } from "@/lib/utils";
import { useAuthUser } from "@/store/app-context-store";

const t = organization.members;

type PendingRemoval = { userId: string; name: string };

export function MembersTable() {
  const currentUser = useAuthUser();
  const { data: members, isLoading } = useOrganizationMembers();
  const { mutate: removeMember } = useRemoveOrgMember();
  const [pending, setPending] = useState<PendingRemoval | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const confirmRemove = async () => {
    if (!pending) return;
    setIsRemoving(true);
    try {
      await removeMember(pending.userId);
    } catch {
      toast.error(t.remove.error);
    } finally {
      setIsRemoving(false);
      setPending(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.table.user}</TableHead>
            <TableHead>{t.table.email}</TableHead>
            <TableHead>{t.table.role}</TableHead>
            <TableHead>{t.table.status}</TableHead>
            <TableHead>{t.table.joined}</TableHead>
            <TableHead className="text-end">{t.table.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center">
                {t.loading}
              </TableCell>
            </TableRow>
          ) : !members || members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center">
                {t.empty}
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => {
              const user = member.user;
              const name = user?.displayName || user?.email || t.unknownUser;
              return (
                <TableRow key={member._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={user?.image || undefined} />
                        <AvatarFallback>{getUserInitials(name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{name}</span>
                    </div>
                  </TableCell>
                  <TableCell dir="ltr" className="text-end">
                    {user?.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{t.roles[member.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.status === "active" ? "default" : "secondary"
                      }
                    >
                      {t.status[member.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.joinedAt
                      ? new Date(member.joinedAt).toLocaleDateString("fa-IR")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-end">
                    {member.userId !== currentUser?._id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`${t.remove.title}: ${name}`}
                        onClick={() =>
                          setPending({ userId: member.userId, name })
                        }
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

      <DeleteConfirmationDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={t.remove.title}
        description={`${pending?.name ?? ""}: ${t.remove.description}`}
        confirmText={t.remove.confirm}
        onConfirm={confirmRemove}
        isLoading={isRemoving}
      />
    </>
  );
}
