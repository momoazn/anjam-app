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
        subtitle={settings.description}
        icon={IconSettings}
      />

      <div className="space-y-4">
        <div className="overflow-x-auto">
          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div className="border-border/40 bg-background/30 w-full rounded-xl border p-4 shadow-none">
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
