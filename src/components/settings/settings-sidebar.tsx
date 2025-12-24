import { Info, Palette, Shield, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { settings } from "@/constants";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "profile", label: settings.tabs.profile, icon: User },
  { id: "appearance", label: settings.tabs.appearance, icon: Palette },
  { id: "security", label: settings.tabs.security, icon: Shield },
  { id: "about", label: settings.tabs.about, icon: Info },
];

type SettingsSidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function SettingsSidebar({
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  return (
    <nav className="flex space-x-2 space-x-reverse lg:flex-col lg:space-y-1 lg:space-x-0">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "secondary" : "ghost"}
            className={cn(
              "justify-start gap-3",
              activeTab === item.id && "bg-muted font-medium",
            )}
            onClick={() => onTabChange(item.id)}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Button>
        );
      })}
    </nav>
  );
}
