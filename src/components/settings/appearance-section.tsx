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
    <div className="space-y-10" data-animate-stagger>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconTerminal className="text-primary/60 size-4" />
            <h3 className="text-sm font-black tracking-widest uppercase">
              {settings.appearance.title}
            </h3>
          </div>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <p className="text-muted-foreground/60 text-right text-xs leading-relaxed font-bold tracking-widest uppercase">
          {settings.appearance.description}
        </p>

        <div className="bg-border/40 border-border/40 grid grid-cols-1 gap-px overflow-hidden border sm:grid-cols-3">
          <Button
            variant="ghost"
            className={cn(
              "bg-card border-border/10 flex h-32 flex-col items-center justify-center gap-4 rounded-none border-s transition-all transition-none",
              theme === "light" && "bg-primary/5 text-primary",
            )}
            onClick={() => setTheme("light")}
          >
            <IconSun
              className={cn(
                "h-6 w-6 transition-transform duration-300",
                theme === "light" && "rotate-12",
              )}
            />
            <span className="text-[11px] font-black tracking-[0.2em] uppercase">
              {settings.appearance.light}
            </span>
            {theme === "light" && (
              <div className="bg-primary absolute end-0 bottom-0 start-0 h-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "bg-card border-border/10 flex h-32 flex-col items-center justify-center gap-4 rounded-none border-s transition-all transition-none",
              theme === "dark" && "bg-primary/5 text-primary",
            )}
            onClick={() => setTheme("dark")}
          >
            <IconMoon
              className={cn(
                "h-6 w-6 transition-transform duration-300",
                theme === "dark" && "-rotate-12",
              )}
            />
            <span className="text-[11px] font-black tracking-[0.2em] uppercase">
              {settings.appearance.dark}
            </span>
            {theme === "dark" && (
              <div className="bg-primary absolute end-0 bottom-0 start-0 h-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "bg-card flex h-32 flex-col items-center justify-center gap-4 rounded-none transition-all transition-none",
              theme === "system" && "bg-primary/5 text-primary",
            )}
            onClick={() => setTheme("system")}
          >
            <IconDeviceDesktop className="h-6 w-6" />
            <span className="text-[11px] font-black tracking-[0.2em] uppercase">
              {settings.appearance.system}
            </span>
            {theme === "system" && (
              <div className="bg-primary absolute end-0 bottom-0 start-0 h-1" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
