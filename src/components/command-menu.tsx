/**
 * Linear-style Command Menu (Cmd+K)
 *
 * Keyboard-first command palette for quick navigation and actions.
 * Fuzzy search, context-aware suggestions, keyboard navigation.
 */
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { commandMenu } from "@/constants";
import { useTheme } from "@/hooks/use-theme";
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

/**
 * Simple fuzzy filter for commands
 */
function filterCommands(
  commands: CommandItem[],
  search: string,
): CommandItem[] {
  if (!search) return commands;

  const searchTerm = search.toLowerCase();

  return commands.filter((cmd) => {
    const labelMatch = cmd.label.toLowerCase().includes(searchTerm);
    const keywordsMatch = cmd.keywords?.some((keyword) =>
      keyword.toLowerCase().includes(searchTerm),
    );
    return labelMatch || keywordsMatch;
  });
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const currentOrgMode = useAuthStore((state) => state.currentOrgMode);
  const isProductMode = currentOrgMode === "product";
  const { resolvedTheme } = useTheme();
  const isProductVisualTheme = isProductMode && resolvedTheme === "dark";
  const inputRef = useRef<HTMLInputElement>(null);

  // Define commands based on current context
  const commands: CommandItem[] = [
    // Navigation
    {
      id: "nav-inbox",
      label: isProductMode
        ? commandMenu.product.inbox
        : commandMenu.operations.myTasks,
      icon: IconSearch,
      action: () => {
        navigate(isProductMode ? "/inbox" : "/my-tasks");
        setOpen(false);
      },
      keywords: commandMenu.keywords.inbox,
    },
    {
      id: "nav-dashboard",
      label: isProductMode
        ? commandMenu.product.dashboard
        : commandMenu.operations.dashboard,
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
      keywords: commandMenu.keywords.dashboard,
    },
    {
      id: "nav-projects",
      label: isProductMode
        ? commandMenu.product.projects
        : commandMenu.operations.projects,
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
      keywords: commandMenu.keywords.projects,
    },
    // Task actions
    {
      id: "task-new",
      label: isProductMode
        ? commandMenu.product.createItem
        : commandMenu.operations.createTask,
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
      keywords: commandMenu.keywords.new,
      shortcut: commandMenu.shortcuts.new,
    },
    // Product mode specific commands
    ...(isProductMode
      ? [
          {
            id: "nav-insights",
            label: commandMenu.product.insights,
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
            keywords: commandMenu.keywords.insights,
          },
        ]
      : []),
    // Settings
    {
      id: "nav-settings",
      label: isProductMode
        ? commandMenu.product.settings
        : commandMenu.operations.settings,
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
      keywords: commandMenu.keywords.settings,
    },
  ];

  // Keyboard shortcuts to open command menu (Cmd/Ctrl+K or `/` when not typing)
  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
    };

    const down = (e: KeyboardEvent) => {
      // Avoid interfering with typing or other shortcuts
      if (isEditableTarget(e.target)) return;

      const isModK = e.key === "k" && (e.metaKey || e.ctrlKey);
      const isSlash = e.key === "/";

      if (isModK || isSlash) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") {
          e.stopImmediatePropagation();
        }
        setOpen((open) => !open);
      }
    };

    // Use capture phase to intercept before other handlers (e.g., browser shortcuts)
    document.addEventListener("keydown", down, { capture: true });
    return () =>
      document.removeEventListener("keydown", down, { capture: true });
  }, []);

  // Allow other components to open the command menu (e.g., header button)
  useEffect(() => {
    const handleOpenEvent = () => setOpen(true);
    window.addEventListener("command-menu:open", handleOpenEvent);
    return () =>
      window.removeEventListener("command-menu:open", handleOpenEvent);
  }, []);

  // Filter commands based on search
  const filteredCommands = filterCommands(commands, search);

  // Reset active item when search changes or menu opens
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(0);
  }, [search, open, filteredCommands.length]);

  // Focus the search input when the menu opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Keyboard navigation inside the command list
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (filteredCommands.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) =>
          i - 1 < 0 ? filteredCommands.length - 1 : i - 1,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        filteredCommands[activeIndex]?.action();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, filteredCommands, activeIndex]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay
        className={cn(
          "backdrop-blur-sm",
          isProductVisualTheme
            ? "bg-[rgba(12,12,14,0.6)]"
            : "bg-[rgba(0,0,0,0.28)]",
          // Glassmorphism for product mode
          isProductVisualTheme && "product-glass",
        )}
      />
      <DialogContent
        className={cn(
          "overflow-hidden p-0 shadow-2xl",
          // Product mode styling
          isProductVisualTheme ? "product-elevated product-beveled" : "bg-card",
        )}
        showCloseButton={false}
      >
        <div className="flex items-center border-b px-3" dir="ltr">
          <IconSearch
            className={cn(
              "size-4 shrink-0",
              isProductVisualTheme
                ? "text-[var(--product-text-secondary)]"
                : "text-muted-foreground",
            )}
          />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "flex h-12 w-full rounded-md bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
              isProductVisualTheme
                ? "text-[var(--product-text-primary)] placeholder:text-[var(--product-text-tertiary)]"
                : "",
            )}
            placeholder={
              isProductMode
                ? commandMenu.product.placeholder
                : commandMenu.operations.placeholder
            }
          />
          <kbd
            className={cn(
              "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100",
              isProductVisualTheme
                ? "border-[var(--product-border)] text-[var(--product-text-tertiary)]"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            <span className="text-xs">{commandMenu.shortcuts.commandK}</span>
          </kbd>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <p
              className={cn(
                "p-4 text-center text-sm",
                isProductVisualTheme
                  ? "text-[var(--product-text-secondary)]"
                  : "text-muted-foreground",
              )}
            >
              {isProductMode
                ? commandMenu.product.noResults
                : commandMenu.operations.noResults}
            </p>
          ) : (
            <div className="flex flex-col gap-1" dir="rtl">
              {filteredCommands.map((cmd: CommandItem, idx) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      isProductVisualTheme
                        ? "text-[var(--product-text-secondary)] hover:text-[var(--product-text-primary)] product-kbd-focus"
                        : "",
                      idx === activeIndex &&
                        (isProductVisualTheme
                          ? "product-selected"
                          : "bg-accent/20"),
                    )}
                    data-active={idx === activeIndex}
                    tabIndex={idx === activeIndex ? 0 : -1}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        isProductVisualTheme
                          ? "text-[var(--product-text-tertiary)]"
                          : "text-muted-foreground",
                      )}
                    />
                    <span className="flex-1 text-right">{cmd.label}</span>
                    {cmd.shortcut && (
                      <kbd
                        className={cn(
                          "pointer-events-none ml-2 inline-flex h-5 select-none items-center rounded border px-1.5 font-mono text-[10px]",
                          isProductVisualTheme
                            ? "border-[var(--product-border)] text-[var(--product-text-tertiary)]"
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
