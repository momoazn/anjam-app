import { IconSettings } from "@tabler/icons-react";
import { useLocation } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { AboutSection } from "@/components/settings/about-section";
import { PreferencesSection } from "@/components/settings/preferences-section";
import { ProfileSection } from "@/components/settings/profile-section";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import {
  type SettingsTabId,
  settingsTabs,
} from "@/components/settings/settings-tabs";
import { settings } from "@/constants";

function tabFromPath(pathname: string): SettingsTabId {
  const last = pathname.split("/").filter(Boolean).pop();
  return settingsTabs.find((tab) => tab.id === last)?.id ?? "profile";
}

export default function SettingsPage() {
  const activeTab = tabFromPath(useLocation().pathname);

  return (
    <PageTransition
      data-testid="settings-page"
      className="container mx-auto max-w-5xl p-4 md:p-6"
    >
      <PageHeader
        title={settings.title}
        subtitle={settings.description}
        icon={IconSettings}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <SettingsSidebar activeTab={activeTab} />
        <div className="min-w-0 flex-1">
          {activeTab === "profile" && <ProfileSection />}
          {activeTab === "preferences" && <PreferencesSection />}
          {activeTab === "about" && <AboutSection />}
        </div>
      </div>
    </PageTransition>
  );
}
