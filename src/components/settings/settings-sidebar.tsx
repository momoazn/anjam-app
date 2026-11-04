import { NavLink } from "react-router-dom";

import {
  type SettingsTabId,
  settingsTabs,
} from "@/components/settings/settings-tabs";
import { settings } from "@/constants";
import { cn } from "@/lib/utils";

// Horizontal scroll strip on mobile, vertical side list on lg+.
export function SettingsSidebar({ activeTab }: { activeTab: SettingsTabId }) {
  return (
    <nav
      aria-label={settings.navLabel}
      className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
    >
      {settingsTabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <NavLink
            key={id}
            to={`/settings/${id}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "focus-visible:ring-ring flex h-10 shrink-0 items-center gap-2.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-2",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}
