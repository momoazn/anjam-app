import { IconSettings } from "@tabler/icons-react";

import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { PreferencesSection } from "@/components/settings/preferences-section";
import { settings } from "@/constants";

export function PreferencesPage() {
  return (
    <PageTransition className="container mx-auto max-w-5xl p-4 md:p-6">
      <PageHeader
        title={settings.preferences.title}
        description={settings.preferences.description}
        icon={IconSettings}
        nodeId="User_Preferences"
      />

      <div className="bg-muted/5 border-border/40 border p-8 shadow-sm">
        <PreferencesSection />
      </div>
    </PageTransition>
  );
}

export default PreferencesPage;
