import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

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
import { organization } from "@/constants";
import {
  getInviteStatus,
  getInviteUrl,
  useOrganizationInvites,
  useRevokeOrgInvite,
} from "@/hooks/organization-members";
import type { Id } from "@/lib/convex";

const t = organization.inviteLinks;

const statusVariant = {
  active: "default",
  expired: "secondary",
  exhausted: "secondary",
  revoked: "destructive",
} as const;

export function InviteLinksTable() {
  const { data: invites, isLoading } = useOrganizationInvites();
  const { mutate: revokeInvite } = useRevokeOrgInvite();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [toRevoke, setToRevoke] = useState<Id<"invites"> | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const copyLink = async (token: string) => {
    try {
      await navigator.clipboard.writeText(getInviteUrl(token));
      setCopiedToken(token);
      toast.success(t.copied);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch {
      toast.error(t.copyError);
    }
  };

  const confirmRevoke = async () => {
    if (!toRevoke) return;
    setIsRevoking(true);
    try {
      await revokeInvite(toRevoke);
    } catch {
      toast.error(t.revokeError);
    } finally {
      setIsRevoking(false);
      setToRevoke(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.table.link}</TableHead>
            <TableHead>{t.table.uses}</TableHead>
            <TableHead>{t.table.expiry}</TableHead>
            <TableHead>{t.table.status}</TableHead>
            <TableHead className="text-end">{t.table.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center">
                {organization.members.loading}
              </TableCell>
            </TableRow>
          ) : !invites || invites.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center">
                {t.empty}
              </TableCell>
            </TableRow>
          ) : (
            invites.map((invite) => {
              const status = getInviteStatus(invite);
              return (
                <TableRow key={invite._id}>
                  <TableCell>
                    {/* Token is an ID, so mono and LTR are right here. */}
                    <Link
                      to={`/invite/${invite.token}`}
                      dir="ltr"
                      title={invite.token}
                      className="focus-visible:ring-ring inline-block rounded-sm font-mono text-sm outline-none hover:underline focus-visible:ring-2"
                    >
                      {invite.token.slice(0, 12)}...
                    </Link>
                  </TableCell>
                  <TableCell>
                    {invite.uses}/{invite.maxUses || "∞"}
                  </TableCell>
                  <TableCell>
                    {invite.expiresAt
                      ? new Date(invite.expiresAt).toLocaleDateString("fa-IR")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[status]}>
                      {t.status[status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={t.copy}
                        title={t.copy}
                        onClick={() => copyLink(invite.token)}
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
                          onClick={() => setToRevoke(invite._id)}
                        >
                          {t.revoke}
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

      <DeleteConfirmationDialog
        open={toRevoke !== null}
        onOpenChange={(open) => !open && setToRevoke(null)}
        title={t.revokeDialog.title}
        description={t.revokeDialog.description}
        confirmText={t.revokeDialog.confirm}
        onConfirm={confirmRevoke}
        isLoading={isRevoking}
      />
    </>
  );
}
