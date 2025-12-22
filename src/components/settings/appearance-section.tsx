import { Laptop, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { settings } from "@/constants";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{settings.appearance.title}</CardTitle>
          <CardDescription>{settings.appearance.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              className={cn(
                "flex h-24 flex-col gap-2 border-2",
                theme === "light" && "border-primary bg-primary/5",
              )}
              onClick={() => setTheme("light")}
            >
              <Sun className="h-6 w-6" />
              <span className="font-medium">{settings.appearance.light}</span>
            </Button>
            <Button
              variant="outline"
              className={cn(
                "flex h-24 flex-col gap-2 border-2",
                theme === "dark" && "border-primary bg-primary/5",
              )}
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-6 w-6" />
              <span className="font-medium">{settings.appearance.dark}</span>
            </Button>
            <Button
              variant="outline"
              className={cn(
                "flex h-24 flex-col gap-2 border-2",
                theme === "system" && "border-primary bg-primary/5",
              )}
              onClick={() => setTheme("system")}
            >
              <Laptop className="h-6 w-6" />
              <span className="font-medium">{settings.appearance.system}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
