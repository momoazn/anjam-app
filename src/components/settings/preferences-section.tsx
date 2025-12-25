import { toast } from "sonner";
import { useState } from "react";
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
    <div className="flex items-center justify-between gap-4">
      <div className="text-right">
        <p className="text-sm font-black tracking-tight uppercase">{label}</p>
        <p className="text-muted-foreground/70 text-[11px]">{description}</p>
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
      <div className="border-border/40 bg-muted/5 text-muted-foreground rounded-none border p-6 text-right text-sm">
        {settings.preferences.signinRequired}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right">
      <section className="border-border/40 bg-muted/5 rounded-none border p-6 shadow-sm">
        <div className="border-border/20 space-y-1 border-b pb-4">
          <p className="text-muted-foreground text-xs font-black tracking-tight uppercase">
            {settings.preferences.title}
          </p>
          <p className="text-muted-foreground text-sm">
            {settings.preferences.description}
          </p>
        </div>
        <div className="mt-4 space-y-4">
          <ToggleRow
            label={settings.preferences.toggles.activityFeed.label}
            description={settings.preferences.toggles.activityFeed.description}
            checked={Boolean(uiPreferences.showActivityFeed)}
            disabled={isBusy || !data}
            onChange={handleActivityToggle}
          />
        </div>
      </section>

      <section className="border-border/40 bg-muted/5 rounded-none border p-6 shadow-sm">
        <div className="border-border/20 mb-4 border-b pb-3">
          <p className="text-muted-foreground text-xs font-black tracking-tight uppercase">
            تنظیمات نمایش
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <span className="text-muted-foreground text-[10px] font-black tracking-tight uppercase">
              تم
            </span>
            <Select
              value={displayPreferences.theme}
              onValueChange={(value) =>
                handleDisplayUpdate({
                  theme: value as DisplayPayload["theme"],
                })
              }
              disabled={isBusy || !data}
            >
              <SelectTrigger className="border-border/40 bg-muted/5 h-12 rounded-none border text-right text-xs font-black tracking-tight uppercase focus:ring-0">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card rounded-none border">
                {themeOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-right text-[10px] font-black uppercase"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-muted-foreground text-[10px] font-black tracking-tight uppercase">
              منطقه زمانی
            </span>
            <Select
              value={displayPreferences.timezone}
              onValueChange={(value) =>
                handleDisplayUpdate({
                  timezone: value as DisplayPayload["timezone"],
                })
              }
              disabled={isBusy || !data}
            >
              <SelectTrigger className="border-border/40 bg-muted/5 h-12 rounded-none border text-right text-xs font-black tracking-tight uppercase focus:ring-0">
                <SelectValue placeholder="Timezone" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card rounded-none border">
                {timezoneOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-right text-[10px] font-black uppercase"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-muted-foreground text-[10px] font-black tracking-tight uppercase">
              فرمت تاریخ
            </span>
            <Select
              value={displayPreferences.dateFormat}
              onValueChange={(value) =>
                handleDisplayUpdate({
                  dateFormat: value as DisplayPayload["dateFormat"],
                })
              }
              disabled={isBusy || !data}
            >
              <SelectTrigger className="border-border/40 bg-muted/5 h-12 rounded-none border text-right text-xs font-black tracking-tight uppercase focus:ring-0">
                <SelectValue placeholder="Date format" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card rounded-none border">
                {dateFormatOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-right text-[10px] font-black uppercase"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="border-border/40 bg-muted/5 rounded-none border p-6 shadow-sm">
        <div className="border-border/20 mb-4 border-b pb-3">
          <p className="text-muted-foreground text-xs font-black tracking-tight uppercase">
            اعلان‌ها
          </p>
        </div>
        <div className="space-y-4">
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
