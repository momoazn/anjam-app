import {
  IconInfoCircle,
  IconPalette,
  IconShield,
  IconUser,
  IconChevronLeft,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { settings } from "@/constants";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "profile", label: settings.tabs.profile, icon: IconUser },
  { id: "appearance", label: settings.tabs.appearance, icon: IconPalette },
  { id: "security", label: settings.tabs.security, icon: IconShield },
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
        <span className="text-muted-foreground/40 text-[10px] font-black tracking-[0.3em] uppercase">
          Config_Modules
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
              "group relative h-12 justify-start gap-4 rounded-none border-s-2 px-4 transition-all transition-none duration-100",
              isActive
                ? "bg-primary/5 border-primary text-primary"
                : "text-muted-foreground/60 hover:bg-muted/30 hover:text-foreground border-transparent",
            )}
            onClick={() => onTabChange(item.id)}
          >
            <Icon
              className={cn(
                "size-5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-primary" : "text-muted-foreground/40",
              )}
            />
            <span
              className={cn(
                "text-[13px] font-black tracking-tight uppercase",
                isActive ? "opacity-100" : "opacity-90",
              )}
            >
              {item.label}
            </span>

            {isActive && (
              <IconChevronLeft className="ms-auto size-4 opacity-40" />
            )}
          </Button>
        );
      })}
    </nav>
  );
}
