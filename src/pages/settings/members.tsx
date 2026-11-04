import { IconAlertTriangle, IconLink, IconUsers } from "@tabler/icons-react";
import { useState } from "react";

import { ErrorBoundary } from "@/components/error-boundary";
import { CreateInviteLinkDialog } from "@/components/organization/create-invite-link-dialog";
import { InviteLinksTable } from "@/components/organization/invite-links-table";
import { MembersTable } from "@/components/organization/members-table";
import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { organization } from "@/constants";

// Inline error state, so a failing query does not replace the whole page.
function SectionError({ retry }: { retry: () => void }) {
  const t = organization.members.loadError;
  return (
    <div
      role="alert"
      className="bg-card flex flex-col items-center gap-3 rounded-2xl border p-8 text-center"
    >
      <IconAlertTriangle className="text-destructive size-6" aria-hidden />
      <div>
        <p className="font-medium">{t.title}</p>
        <p className="text-muted-foreground text-sm">{t.description}</p>
      </div>
      <Button variant="outline" size="sm" onClick={retry}>
        {t.retry}
      </Button>
    </div>
  );
}

export function OrgMembersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <PageTransition
      data-testid="org-members-page"
      className="container mx-auto max-w-7xl p-4 md:p-6"
    >
      <PageHeader
        title={organization.members.title}
        subtitle={organization.members.subtitle}
        icon={IconUsers}
        actions={
          <Button onClick={() => setIsCreateOpen(true)} size="xs">
            <IconLink className="size-4" />
            {organization.inviteLinks.create}
          </Button>
        }
      />

      <ErrorBoundary fallback={(retry) => <SectionError retry={retry} />}>
        <MembersTable />
      </ErrorBoundary>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">
          {organization.inviteLinks.title}
        </h2>
        <p className="text-muted-foreground mt-1 mb-4 text-sm">
          {organization.inviteLinks.description}
        </p>
        <ErrorBoundary fallback={(retry) => <SectionError retry={retry} />}>
          <InviteLinksTable />
        </ErrorBoundary>
      </div>

      <CreateInviteLinkDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </PageTransition>
  );
}
