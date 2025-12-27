import {
  IconDeviceDesktop,
  IconMoon,
  IconSun,
  IconTerminal,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { settings } from "@/constants";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8" data-animate-stagger>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconTerminal className="text-primary size-4" />
            <h3 className="text-sm font-black tracking-tight uppercase">
              {settings.appearance.title}
            </h3>
          </div>
          <div className="h-0.5 flex-1 bg-black" />
        </div>

        <p className="text-muted-foreground font-mono text-[10px] font-black tracking-widest uppercase">
          {settings.appearance.description}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Button
            variant="ghost"
            className={cn(
              "group relative flex h-24 flex-col items-center justify-center gap-3 rounded-none border-2 border-black bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all duration-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
              theme === "light" && "bg-primary/5 border-primary text-primary",
            )}
            onClick={() => setTheme("light")}
          >
            <IconSun
              className={cn(
                "size-5 transition-transform duration-300",
                theme === "light" && "rotate-12",
              )}
            />
            <span className="text-[10px] font-black tracking-tight uppercase">
              {settings.appearance.light}
            </span>
            {theme === "light" && (
              <div className="bg-primary absolute right-0 bottom-0 left-0 h-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "group relative flex h-24 flex-col items-center justify-center gap-3 rounded-none border-2 border-black bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all duration-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
              theme === "dark" && "bg-primary/5 border-primary text-primary",
            )}
            onClick={() => setTheme("dark")}
          >
            <IconMoon
              className={cn(
                "size-5 transition-transform duration-300",
                theme === "dark" && "-rotate-12",
              )}
            />
            <span className="text-[10px] font-black tracking-tight uppercase">
              {settings.appearance.dark}
            </span>
            {theme === "dark" && (
              <div className="bg-primary absolute right-0 bottom-0 left-0 h-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "group relative flex h-24 flex-col items-center justify-center gap-3 rounded-none border-2 border-black bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all duration-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
              theme === "system" && "bg-primary/5 border-primary text-primary",
            )}
            onClick={() => setTheme("system")}
          >
            <IconDeviceDesktop className="size-5" />
            <span className="text-[10px] font-black tracking-tight uppercase">
              {settings.appearance.system}
            </span>
            {theme === "system" && (
              <div className="bg-primary absolute right-0 bottom-0 left-0 h-1" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
