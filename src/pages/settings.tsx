import { IconSettings } from "@tabler/icons-react";
import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { AboutSection } from "@/components/settings/about-section";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { PreferencesSection } from "@/components/settings/preferences-section";
import { ProfileSection } from "@/components/settings/profile-section";
import { SecuritySection } from "@/components/settings/security-section";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { settings } from "@/constants";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
      <PageHeader
        title={settings.title}
        description={settings.description}
        icon={IconSettings}
      />

      <div className="flex flex-col items-start gap-10 lg:flex-row">
        <aside className="sticky top-24 lg:w-1/4">
          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        <div className="bg-muted/5 border-border/40 w-full flex-1 border p-8 shadow-sm">
          {activeTab === "profile" && <ProfileSection />}
          {activeTab === "appearance" && <AppearanceSection />}
          {activeTab === "security" && <SecuritySection />}
          {activeTab === "preferences" && <PreferencesSection />}
          {activeTab === "about" && <AboutSection />}
        </div>
      </div>
    </PageTransition>
  );
}
