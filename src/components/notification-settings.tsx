import { IconVolume2, IconVolumeOff } from "@tabler/icons-react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useSoundEnabled,
  useSetSoundEnabled,
} from "@/store/notification-store";

export function NotificationSettings() {
  const soundEnabled = useSoundEnabled();
  const setSoundEnabled = useSetSoundEnabled();

  return (
    <div className="space-y-6">
      {/* Sound Settings */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Sound Notifications</h3>
          <p className="text-muted-foreground text-sm">
            Play sounds when notifications arrive
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2 text-base">
              {soundEnabled ? (
                <IconVolume2 className="size-4" />
              ) : (
                <IconVolumeOff className="size-4" />
              )}
              Enable Sound
            </Label>
            <p className="text-muted-foreground text-sm">
              Play notification sounds (requires browser permission)
            </p>
          </div>
          <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
        </div>
      </div>
    </div>
  );
}
