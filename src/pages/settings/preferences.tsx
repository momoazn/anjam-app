import { IconSettings } from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { PreferencesSection } from "@/components/settings/preferences-section";
import { settings } from "@/constants";

export default function PreferencesPage() {
  return (
    <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
      <PageHeader
        title={settings.preferences.title}
        description={settings.preferences.description}
        icon={IconSettings}
      />

      <div className="mt-8">
        <PreferencesSection />
      </div>
    </PageTransition>
  );
}
