import {
  IconAdjustmentsHorizontal,
  IconInfoCircle,
  IconUser,
} from "@tabler/icons-react";

import { settings } from "@/constants";

export const settingsTabs = [
  { id: "profile", label: settings.tabs.profile, icon: IconUser },
  {
    id: "preferences",
    label: settings.tabs.preferences,
    icon: IconAdjustmentsHorizontal,
  },
  { id: "about", label: settings.tabs.about, icon: IconInfoCircle },
] as const;

export type SettingsTabId = (typeof settingsTabs)[number]["id"];
