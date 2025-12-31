import {
  IconAdjustmentsHorizontal,
  IconChevronLeft,
  IconInfoCircle,
  IconPalette,
  IconShield,
  IconUser,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { settings } from "@/constants";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "profile", label: settings.tabs.profile, icon: IconUser },
  { id: "appearance", label: settings.tabs.appearance, icon: IconPalette },
  { id: "security", label: settings.tabs.security, icon: IconShield },
  {
    id: "preferences",
    label: settings.tabs.preferences,
    icon: IconAdjustmentsHorizontal,
  },
  { id: "about", label: settings.tabs.about, icon: IconInfoCircle },
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
    <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
      <div className="mb-4 hidden px-4 lg:block">
        <span className="text-muted-foreground/40 text-[10px] font-bold tracking-tight">
          {settings.configModules}
        </span>
      </div>

      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "group relative h-10 justify-start gap-3 rounded-xl px-4 transition-all transition-none duration-100",
              isActive
                ? "bg-primary/5 text-primary shadow-sm"
                : "text-muted-foreground/60 hover:bg-muted/30 hover:text-foreground",
            )}
            onClick={() => onTabChange(item.id)}
          >
            <Icon
              className={cn(
                "size-4 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-primary" : "text-muted-foreground/40",
              )}
            />
            <span
              className={cn(
                "text-[11px] font-bold tracking-tight",
                isActive ? "opacity-100" : "opacity-90",
              )}
            >
              {item.label}
            </span>

            {isActive && (
              <IconChevronLeft className="ms-auto size-3.5 opacity-40" />
            )}
          </Button>
        );
      })}
    </nav>
  );
}
