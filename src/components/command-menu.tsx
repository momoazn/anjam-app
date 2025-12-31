/**
 * Linear-style Command Menu (Cmd+K)
 *
 * Keyboard-first command palette for quick navigation and actions.
 * Fuzzy search, context-aware suggestions, keyboard navigation.
 */
import { IconSearch } from "@tabler/icons-react";
import Fuse from "fuse.js";
import {
  BarChart3,
  FolderOpen,
  LayoutGrid,
  Plus,
  Settings,
} from "lucide-react";
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
 * Fuzzy filter for commands using fuse.js
 */
function filterCommands(
  commands: CommandItem[],
  search: string,
): CommandItem[] {
  if (!search) return commands;

  const fuse = new Fuse(commands, {
    keys: ["label", "keywords"],
    threshold: 0.4,
  });

  return fuse.search(search).map((result) => result.item);
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

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setActiveIndex(0);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setActiveIndex(0);
    }
  };

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
      icon: LayoutGrid,
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
      icon: FolderOpen,
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
      icon: Plus,
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
            icon: BarChart3,
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
      icon: Settings,
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            onChange={(e) => handleSearchChange(e.target.value)}
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
                    type="button"
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
