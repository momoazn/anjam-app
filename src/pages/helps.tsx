import { IconHelp } from "@tabler/icons-react";

import { HelpCategories } from "@/components/help/help-categories";
import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { helps } from "@/constants";

export default function Helps() {
  return (
    <PageTransition className="container mx-auto max-w-5xl p-4 md:p-6">
      <PageHeader
        title={helps.title}
        description={helps.description}
        icon={IconHelp}
      />
      <div className="space-y-10">
        <HelpCategories />
      </div>
    </PageTransition>
  );
}
