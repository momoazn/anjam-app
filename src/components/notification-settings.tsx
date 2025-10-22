import React, { useState } from "react";
import { IconVolume2, IconVolumeOff } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  useSoundEnabled,
  useSetSoundEnabled,
} from "@/store/notification-store";

interface NotificationPreferences {
  taskAssigned: boolean;
  taskUpdated: boolean;
  projectUpdated: boolean;
  comments: boolean;
  soundEnabled: boolean;
  priority: "low" | "medium" | "high";
}

const defaultPreferences: NotificationPreferences = {
  taskAssigned: true,
  taskUpdated: true,
  projectUpdated: true,
  comments: true,
  soundEnabled: false,
  priority: "medium",
};

export function NotificationSettings() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const soundEnabled = useSoundEnabled();
  const setSoundEnabled = useSetSoundEnabled();

  // Sync local state with store
  React.useEffect(() => {
    setPreferences((prev) => ({
      ...prev,
      soundEnabled,
    }));
  }, [soundEnabled]);

  const handlePreferenceChange = (
    key: keyof NotificationPreferences,
    value: boolean | string,
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Save to backend API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Settings saved", {
        description: "Your notification preferences have been updated.",
      });
    } catch {
      toast.error("Failed to save notification settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPreferences(defaultPreferences);
    toast.success("Settings reset", {
      description: "Notification preferences have been reset to defaults.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Notification Types */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Notification Types</h3>
          <p className="text-muted-foreground text-sm">
            Choose which events you want to be notified about
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Task Assignments</Label>
              <p className="text-muted-foreground text-sm">
                When you're assigned to a new task
              </p>
            </div>
            <Switch
              checked={preferences.taskAssigned}
              onCheckedChange={(checked) =>
                handlePreferenceChange("taskAssigned", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Task Updates</Label>
              <p className="text-muted-foreground text-sm">
                When tasks you're assigned to are updated
              </p>
            </div>
            <Switch
              checked={preferences.taskUpdated}
              onCheckedChange={(checked) =>
                handlePreferenceChange("taskUpdated", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Project Updates</Label>
              <p className="text-muted-foreground text-sm">
                When projects you're involved in are updated
              </p>
            </div>
            <Switch
              checked={preferences.projectUpdated}
              onCheckedChange={(checked) =>
                handlePreferenceChange("projectUpdated", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Comments</Label>
              <p className="text-muted-foreground text-sm">
                When comments are added to your tasks
              </p>
            </div>
            <Switch
              checked={preferences.comments}
              onCheckedChange={(checked) =>
                handlePreferenceChange("comments", checked)
              }
            />
          </div>
        </div>
      </div>

      <Separator />

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
              {preferences.soundEnabled ? (
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

      <Separator />

      {/* Priority Settings */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Notification Priority</h3>
          <p className="text-muted-foreground text-sm">
            Set the minimum priority level for notifications
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Minimum Priority</Label>
          <Select
            value={preferences.priority}
            onValueChange={(value: "low" | "medium" | "high") =>
              handlePreferenceChange("priority", value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low - All notifications</SelectItem>
              <SelectItem value="medium">
                Medium - Important notifications only
              </SelectItem>
              <SelectItem value="high">
                High - Critical notifications only
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
