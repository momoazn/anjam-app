import { useState } from "react";

import { PageTransition } from "@/components/page-transition";
import { AboutSection } from "@/components/settings/about-section";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { ProfileSection } from "@/components/settings/profile-section";
import { SecuritySection } from "@/components/settings/security-section";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { settings } from "@/constants";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div dir="rtl" className="min-h-screen pb-10">
      <PageTransition className="container mx-auto max-w-5xl p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {settings.title}
          </h1>
          <p className="text-muted-foreground mt-2">{settings.description}</p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-1/4">
            <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </aside>

          <div className="flex-1">
            {activeTab === "profile" && <ProfileSection />}
            {activeTab === "appearance" && <AppearanceSection />}
            {activeTab === "security" && <SecuritySection />}
            {activeTab === "about" && <AboutSection />}
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
