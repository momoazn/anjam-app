import { useState } from "react";
import { toast } from "sonner";

import { SettingsCard } from "@/components/settings/settings-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { settings } from "@/constants";
import { useTheme } from "@/hooks/use-theme";
import { useAuthUser } from "@/store/app-context-store";
import {
  DEFAULT_USER_PREFERENCES,
  useUpdateUserPreferences,
  useUserPreferences,
} from "@/store/preferences-store";

type PreferencesPayload = typeof DEFAULT_USER_PREFERENCES;
type DisplayPayload = PreferencesPayload["display"];

const timezoneOptions = [
  { value: "auto", label: settings.preferences.timezones.auto },
  { value: "UTC", label: settings.preferences.timezones.utc },
  { value: "Asia/Tehran", label: settings.preferences.timezones.tehran },
  { value: "Europe/London", label: settings.preferences.timezones.london },
  { value: "America/New_York", label: settings.preferences.timezones.newYork },
];

const dateFormatOptions = [
  { value: "locale", label: settings.preferences.dateFormats.locale },
  { value: "yyyy/MM/dd", label: settings.preferences.dateFormats.ymd },
  { value: "dd/MM/yyyy", label: settings.preferences.dateFormats.dmy },
  { value: "MM/dd/yyyy", label: settings.preferences.dateFormats.mdy },
];

const themeOptions = [
  { value: "light", label: settings.preferences.light },
  { value: "dark", label: settings.preferences.dark },
  { value: "system", label: settings.preferences.system },
];

type ToggleRowProps = {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
};

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={(value) => onChange(Boolean(value))}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  );
}

export function PreferencesSection() {
  const user = useAuthUser();
  const { data, isLoading } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const [isSaving, setIsSaving] = useState(false);
  const { setTheme } = useTheme();

  const preferencesData: PreferencesPayload = {
    ...DEFAULT_USER_PREFERENCES,
    ...(data as PreferencesPayload | undefined),
  };
  const uiPreferences = preferencesData.ui;
  const displayPreferences = preferencesData.display;

  const isBusy = isLoading || isSaving;

  const handleActivityToggle = async (value: boolean) => {
    setIsSaving(true);
    try {
      await updatePreferences.mutate({
        updates: {
          ...preferencesData,
          ui: {
            ...uiPreferences,
            showActivityFeed: value,
          },
        },
      });
      toast.success(settings.preferences.saveSuccess);
    } catch {
      toast.error(settings.preferences.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisplayUpdate = async (updates: Partial<DisplayPayload>) => {
    setIsSaving(true);
    try {
      const nextDisplay = { ...displayPreferences, ...updates };
      await updatePreferences.mutate({
        updates: {
          ...preferencesData,
          display: nextDisplay,
        },
      });
      if (updates.theme) {
        setTheme(updates.theme);
      }
      toast.success(settings.preferences.saveSuccess);
    } catch {
      toast.error(settings.preferences.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-card border-border rounded-xl border p-8 text-center shadow-xs">
        <p className="text-foreground text-base font-medium">
          {settings.preferences.signinRequired}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SettingsCard
        title={settings.preferences.title}
        description={settings.preferences.description}
      >
        <div className="space-y-1">
          <ToggleRow
            label={settings.preferences.activityFeed.label}
            description={settings.preferences.activityFeed.description}
            checked={Boolean(uiPreferences.showActivityFeed)}
            disabled={isBusy || !data}
            onChange={handleActivityToggle}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title={settings.preferences.displayTitle}
        description={settings.preferences.displayDescription}
      >
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="pref-theme" className="text-sm font-medium">
              {settings.preferences.theme}
            </label>
            <Select
              value={displayPreferences.theme}
              onValueChange={(value) =>
                handleDisplayUpdate({
                  theme: value as DisplayPayload["theme"],
                })
              }
              disabled={isBusy || !data}
            >
              <SelectTrigger id="pref-theme">
                <SelectValue placeholder={settings.preferences.theme} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {themeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="pref-timezone" className="text-sm font-medium">
              {settings.preferences.timezone}
            </label>
            <Select
              value={displayPreferences.timezone}
              onValueChange={(value) =>
                handleDisplayUpdate({
                  timezone: value as DisplayPayload["timezone"],
                })
              }
              disabled={isBusy || !data}
            >
              <SelectTrigger id="pref-timezone">
                <SelectValue placeholder={settings.preferences.timezone} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {timezoneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="pref-dateFormat" className="text-sm font-medium">
              {settings.preferences.dateFormat}
            </label>
            <Select
              value={displayPreferences.dateFormat}
              onValueChange={(value) =>
                handleDisplayUpdate({
                  dateFormat: value as DisplayPayload["dateFormat"],
                })
              }
              disabled={isBusy || !data}
            >
              <SelectTrigger id="pref-dateFormat">
                <SelectValue placeholder={settings.preferences.dateFormat} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {dateFormatOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
