/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";
import { useState } from "react";
import { IconPalette, IconBell, IconSettings } from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { settings } from "@/constants";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_USER_PREFERENCES,
  useUpdateUserPreferences,
  useUserPreferences,
} from "@/hooks";
import { useTheme } from "@/hooks/use-theme";
import { handlePocketBaseError } from "@/lib/error-handler";
import { useAuthUser } from "@/store/auth-store";

type NotificationKey = keyof typeof DEFAULT_NOTIFICATION_PREFERENCES;
type PreferencesPayload = typeof DEFAULT_USER_PREFERENCES;
type NotificationPayload = typeof DEFAULT_NOTIFICATION_PREFERENCES;
type DisplayPayload = PreferencesPayload["display"];

const timezoneOptions = [
  { value: "auto", label: "خودکار" },
  { value: "UTC", label: "UTC" },
  { value: "Asia/Tehran", label: "Asia/Tehran" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "America/New_York", label: "America/New_York" },
];

const dateFormatOptions = [
  { value: "locale", label: "مطابق تنظیمات دستگاه" },
  { value: "yyyy/MM/dd", label: "YYYY/MM/DD" },
  { value: "dd/MM/yyyy", label: "DD/MM/YYYY" },
  { value: "MM/dd/yyyy", label: "MM/DD/YYYY" },
];

const themeOptions = [
  { value: "light", label: settings.appearance.light },
  { value: "dark", label: settings.appearance.dark },
  { value: "system", label: settings.appearance.system },
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
    <div className="group border-border flex items-center justify-between gap-6 border-b py-4 last:border-0">
      <div className="text-right">
        <p className="text-sm font-bold tracking-tight">{label}</p>
        <p className="text-muted-foreground text-xs font-medium">
          {description}
        </p>
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

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-border mb-6 flex items-center gap-4 border-b pb-4">
      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
        <Icon className="size-6" stroke={1.5} />
      </div>
      <div className="text-right">
        <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        {description && (
          <p className="text-muted-foreground text-xs font-medium">
            {description}
          </p>
        )}
      </div>
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
    ...(data?.preferences as PreferencesPayload | undefined),
  };
  const uiPreferences = preferencesData.ui;
  const displayPreferences = preferencesData.display;
  const notificationPrefs: NotificationPayload = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(data?.notifications as NotificationPayload | undefined),
  };

  const isBusy = isLoading || isSaving;
  const notificationToggles: Record<
    NotificationKey,
    {
      label: string;
      description: string;
    }
  > = {
    taskAssigned: settings.preferences.toggles.taskAssigned,
    projectUpdated: settings.preferences.toggles.projectUpdated,
  };

  const handleActivityToggle = async (value: boolean) => {
    if (!data) return;
    setIsSaving(true);
    try {
      await updatePreferences.mutateAsync({
        id: data.id,
        updates: {
          preferences: {
            ...preferencesData,
            ui: {
              ...uiPreferences,
              showActivityFeed: value,
            },
          },
        },
      });
      toast.success("ترجیحات ذخیره شد");
    } catch (error) {
      handlePocketBaseError(error as Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisplayUpdate = async (updates: Partial<DisplayPayload>) => {
    if (!data) return;
    setIsSaving(true);
    try {
      const nextDisplay = { ...displayPreferences, ...updates };
      await updatePreferences.mutateAsync({
        id: data.id,
        updates: {
          preferences: {
            ...preferencesData,
            display: nextDisplay,
          },
        },
      });
      if (updates.theme) {
        setTheme(updates.theme);
      }
      toast.success("ترجیحات ذخیره شد");
    } catch (error) {
      handlePocketBaseError(error as Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationToggle = async (
    key: NotificationKey,
    value: boolean,
  ) => {
    if (!data) return;
    setIsSaving(true);
    try {
      await updatePreferences.mutateAsync({
        id: data.id,
        updates: {
          notifications: {
            ...notificationPrefs,
            [key]: value,
          },
        },
      });
      toast.success("ترجیحات ذخیره شد");
    } catch (error) {
      handlePocketBaseError(error as Error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-card border-border rounded-lg border p-8 text-center shadow-sm">
        <p className="text-foreground text-base font-bold tracking-tight">
          {settings.preferences.signinRequired}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right">
      {/* UI Preferences */}
      <section className="bg-card border-border rounded-lg border p-6 shadow-sm">
        <SectionHeader
          icon={IconSettings}
          title={settings.preferences.title}
          description="تنظیمات رابط کاربری سیستم"
        />
        <div className="space-y-1">
          <ToggleRow
            label={settings.preferences.toggles.activityFeed.label}
            description={settings.preferences.toggles.activityFeed.description}
            checked={Boolean(uiPreferences.showActivityFeed)}
            disabled={isBusy || !data}
            onChange={handleActivityToggle}
          />
        </div>
      </section>

      {/* Display Settings */}
      <section className="bg-card border-border rounded-lg border p-6 shadow-sm">
        <SectionHeader
          icon={IconPalette}
          title="تنظیمات نمایش"
          description="پارامترهای بصری سیستم"
        />
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              تم سیستم
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
              <SelectTrigger className="h-11 text-right">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-right"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              منطقه زمانی
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
              <SelectTrigger className="h-11 text-right">
                <SelectValue placeholder="Timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezoneOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-right"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              فرمت تاریخ
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
              <SelectTrigger className="h-11 text-right">
                <SelectValue placeholder="Date format" />
              </SelectTrigger>
              <SelectContent>
                {dateFormatOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-right"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-card border-border rounded-lg border p-6 shadow-sm">
        <SectionHeader
          icon={IconBell}
          title="اعلان‌ها"
          description="مدیریت دریافت اعلان‌های سیستم"
        />
        <div className="space-y-1">
          {(Object.keys(notificationToggles) as NotificationKey[]).map(
            (key) => (
              <ToggleRow
                key={key}
                label={notificationToggles[key].label}
                description={notificationToggles[key].description}
                checked={Boolean(notificationPrefs[key])}
                disabled={isBusy || !data}
                onChange={(value) => handleNotificationToggle(key, value)}
              />
            ),
          )}
        </div>
      </section>
    </div>
  );
}
