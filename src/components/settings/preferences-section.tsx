import { toast } from "sonner";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { settings } from "@/constants";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_USER_PREFERENCES,
  useUpdateUserPreferences,
  useUserPreferences,
} from "@/hooks";
import { handlePocketBaseError } from "@/lib/error-handler";
import { useAuthUser } from "@/store/auth-store";

type NotificationKey = keyof typeof DEFAULT_NOTIFICATION_PREFERENCES;
type PreferencesPayload = typeof DEFAULT_USER_PREFERENCES;
type NotificationPayload = typeof DEFAULT_NOTIFICATION_PREFERENCES;

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
        <p className="text-sm font-black tracking-[0.3em] uppercase">{label}</p>
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

  const preferencesData: PreferencesPayload = {
    ...DEFAULT_USER_PREFERENCES,
    ...(data?.preferences as PreferencesPayload | undefined),
  };
  const uiPreferences = preferencesData.ui;
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
      <div className="border-border/40 bg-muted/5 text-muted-foreground rounded-xl border p-6 text-right text-sm">
        {settings.preferences.signinRequired}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right">
      <section className="border-border/40 bg-muted/5 rounded-xl border p-6 shadow-sm">
        <div className="border-border/20 space-y-1 border-b pb-4">
          <p className="text-muted-foreground text-xs font-black tracking-[0.4em] uppercase">
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

      <section className="border-border/40 bg-muted/5 rounded-xl border p-6 shadow-sm">
        <div className="border-border/20 mb-4 border-b pb-3">
          <p className="text-muted-foreground text-xs font-black tracking-[0.4em] uppercase">
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
