import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { organization, shared } from "@/constants";
import { useCreateOrgInvite } from "@/hooks/organization-members";

const t = organization.inviteLinks;

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

// The backend always creates links with the "member" role, so there is no role field.
export function CreateInviteLinkDialog({ open, onOpenChange }: Props) {
  const { mutate: createInviteLink } = useCreateOrgInvite();
  const [maxUses, setMaxUses] = useState(50);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await createInviteLink({ maxUses });
      onOpenChange(false);
      setMaxUses(50);
      toast.success(t.createDialog.success);
    } catch {
      toast.error(t.createDialog.error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.createDialog.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <label htmlFor="invite-max-uses" className="text-sm font-medium">
            {t.createDialog.maxUses}
          </label>
          <Input
            id="invite-max-uses"
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(parseInt(e.target.value) || 50)}
            placeholder={t.createDialog.maxUsesPlaceholder}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {shared.cancel}
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? shared.loading : t.createDialog.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
