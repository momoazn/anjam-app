/**
 * Linear-style Command Menu (Cmd+K)
 *
 * Keyboard-first command palette for quick navigation and actions.
 * Fuzzy search, context-aware suggestions, keyboard navigation.
 */
import { IconSearch } from "@tabler/icons-react";
import { commandify } from "cmdk";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
  shortcut?: string;
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const currentOrgMode = useAuthStore((state) => state.currentOrgMode);
  const isProductMode = currentOrgMode === "product";

  // Define commands based on current context
  const commands: CommandItem[] = [
    // Navigation
    {
      id: "nav-inbox",
      label: isProductMode ? "Inbox" : "تسک‌های من",
      icon: IconSearch,
      action: () => {
        navigate(isProductMode ? "/inbox" : "/my-tasks");
        setOpen(false);
      },
      keywords: ["inbox", "tasks", "my tasks", "تسک"],
    },
    {
      id: "nav-dashboard",
      label: isProductMode ? "Dashboard" : "داشبورد",
      icon: () => (
        <svg
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
      action: () => {
        navigate("/dashboard");
        setOpen(false);
      },
      keywords: ["dashboard", "home", "داشبورد"],
    },
    {
      id: "nav-projects",
      label: isProductMode ? "Projects" : "پروژه‌ها",
      icon: () => (
        <svg
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      ),
      action: () => {
        navigate("/projects");
        setOpen(false);
      },
      keywords: ["projects", "پروژه"],
    },
    // Task actions
    {
      id: "task-new",
      label: isProductMode ? "New issue" : "ایجاد تسک جدید",
      icon: () => (
        <svg
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
      action: () => {
        navigate("/tasks/new");
        setOpen(false);
      },
      keywords: ["new", "create", "task", "issue", "ایجاد", "تسک", "جدید"],
      shortcut: "N",
    },
    // Product mode specific commands
    ...(isProductMode
      ? [
          {
            id: "nav-insights",
            label: "Insights",
            icon: () => (
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            ),
            action: () => {
              navigate("/insights");
              setOpen(false);
            },
            keywords: ["insights", "reports", "analytics", "views"],
          },
        ]
      : []),
    // Settings
    {
      id: "nav-settings",
      label: isProductMode ? "Settings" : "تنظیمات",
      icon: () => (
        <svg
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      action: () => {
        navigate("/settings");
        setOpen(false);
      },
      keywords: ["settings", "preferences", "تنظیمات"],
    },
  ];

  // Keyboard shortcut to open command menu
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Filter commands based on search
  const filteredCommands = commandify(commands, search);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay
        className={cn(
          "bg-black/80 backdrop-blur-sm",
          // Linear glassmorphism for product mode
          isProductMode && "linear-glass",
        )}
      />
      <DialogContent
        className={cn(
          "overflow-hidden p-0 shadow-2xl",
          // Linear styling for product mode
          isProductMode ? "linear-elevated linear-beveled" : "bg-card",
        )}
        showCloseButton={false}
      >
        <div className="flex items-center border-b px-3" dir="ltr">
          <IconSearch
            className={cn(
              "size-4 shrink-0",
              isProductMode
                ? "text-[var(--linear-text-secondary)]"
                : "text-muted-foreground",
            )}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "flex h-12 w-full rounded-md bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
              isProductMode
                ? "text-[var(--linear-text-primary)] placeholder:text-[var(--linear-text-tertiary)]"
                : "",
            )}
            placeholder={
              isProductMode ? "Type a command or search..." : "تایپ کنید..."
            }
          />
          <kbd
            className={cn(
              "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100",
              isProductMode
                ? "border-[var(--linear-border)] text-[var(--linear-text-tertiary)]"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <p
              className={cn(
                "p-4 text-center text-sm",
                isProductMode
                  ? "text-[var(--linear-text-secondary)]"
                  : "text-muted-foreground",
              )}
            >
              No results found.
            </p>
          ) : (
            <div className="flex flex-col gap-1" dir="rtl">
              {filteredCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      isProductMode
                        ? "text-[var(--linear-text-secondary)] hover:text-[var(--linear-text-primary)] linear-kbd-focus"
                        : "",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        isProductMode
                          ? "text-[var(--linear-text-tertiary)]"
                          : "text-muted-foreground",
                      )}
                    />
                    <span className="flex-1 text-right">{cmd.label}</span>
                    {cmd.shortcut && (
                      <kbd
                        className={cn(
                          "pointer-events-none ml-2 inline-flex h-5 select-none items-center rounded border px-1.5 font-mono text-[10px]",
                          isProductMode
                            ? "border-[var(--linear-border)] text-[var(--linear-text-tertiary)]"
                            : "border-border bg-muted text-muted-foreground",
                        )}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
