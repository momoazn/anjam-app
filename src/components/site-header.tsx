import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TEXT } from "@/constants/text";
import { useTheme } from "@/hooks/use-theme";

export function SiteHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="flex h-10 shrink-0 items-center gap-2 border-b transition-[width] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ms-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{TEXT.header.title}</h1>
      </div>
      <div className="ml-auto px-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">
            {resolvedTheme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"}
          </span>
        </Button>
      </div>
    </header>
  );
}
