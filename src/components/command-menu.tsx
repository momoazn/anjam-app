/**
 * Linear-style Command Menu (Cmd+K)
 *
 * Keyboard-first command palette for quick navigation, actions, and global search.
 * Fuzzy search, context-aware suggestions, keyboard navigation.
 */
import {
  IconActivity,
  IconHash,
  IconSearch,
  IconTarget,
} from "@tabler/icons-react";
import Fuse from "fuse.js";
import { FileText, FolderOpen, Plus, Settings } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { commandMenu } from "@/constants";
import { useGlobalSearch } from "@/hooks/use-global-search";
import type { SearchResponse } from "@/hooks/use-global-search";
import { cn } from "@/lib/utils";
import { useOpenModal } from "@/store/modal-store";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
  shortcut?: string;
  type: "command";
}

interface SearchResultItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  subtitle?: string;
  badge?: string;
  type: "task" | "project";
}

type MenuItem = CommandItem | SearchResultItem;

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
  const [debouncedQuery] = useDebounce(search, 300);
  const navigate = useNavigate();
  const openModal = useOpenModal();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchData, isLoading: isSearchLoading } =
    useGlobalSearch(debouncedQuery);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setActiveIndex(0);
  }, []);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setActiveIndex(0);
    } else {
      setSearch("");
    }
  }, []);

  const navigateToInbox = useCallback(() => {
    navigate("/inbox");
    setOpen(false);
  }, [navigate]);

  const navigateToProjects = useCallback(() => {
    navigate("/projects");
    setOpen(false);
  }, [navigate]);

  const navigateToNewTask = useCallback(() => {
    openModal("create-task");
    setOpen(false);
  }, [openModal]);

  const navigateToNewProject = useCallback(() => {
    openModal("create-project");
    setOpen(false);
  }, [openModal]);

  const navigateToInsights = useCallback(() => {
    navigate("/insights");
    setOpen(false);
  }, [navigate]);

  const navigateToSettings = useCallback(() => {
    navigate("/settings");
    setOpen(false);
  }, [navigate]);

  const navigateToTask = useCallback(
    (taskId: string) => {
      navigate(`/tasks/${taskId}`);
      setOpen(false);
    },
    [navigate],
  );

  const navigateToProject = useCallback(
    (projectId: string) => {
      navigate(`/projects/${projectId}/details`);
      setOpen(false);
    },
    [navigate],
  );

  // Define commands based on current context
  const commands: CommandItem[] = useMemo((): CommandItem[] => {
    const items: CommandItem[] = [
      {
        id: "nav-inbox",
        label: commandMenu.labels.inbox,
        icon: IconSearch,
        action: navigateToInbox,
        keywords: commandMenu.keywords.inbox,
        type: "command",
      },
      {
        id: "nav-projects",
        label: commandMenu.labels.projects,
        icon: FolderOpen,
        action: navigateToProjects,
        keywords: commandMenu.keywords.projects,
        type: "command",
      },
      {
        id: "project-new",
        label: commandMenu.labels.createProject,
        icon: FolderOpen,
        action: navigateToNewProject,
        keywords: commandMenu.keywords.new,
        type: "command",
      },
      {
        id: "task-new",
        label: commandMenu.labels.createItem,
        icon: Plus,
        action: navigateToNewTask,
        keywords: commandMenu.keywords.new,
        type: "command",
      },
      {
        id: "nav-insights",
        label: commandMenu.labels.insights,
        icon: IconActivity,
        action: navigateToInsights,
        keywords: commandMenu.keywords.insights,
        type: "command",
      },
      {
        id: "nav-settings",
        label: commandMenu.labels.settings,
        icon: Settings,
        action: navigateToSettings,
        keywords: commandMenu.keywords.settings,
        type: "command",
      },
    ];

    return items;
  }, [
    navigateToInbox,
    navigateToProjects,
    navigateToNewProject,
    navigateToNewTask,
    navigateToInsights,
    navigateToSettings,
  ]);

  // Transform search results to menu items
  const searchResults: SearchResultItem[] = useMemo((): SearchResultItem[] => {
    if (!searchData) return [];

    const items: SearchResultItem[] = [];

    // Add tasks
    if (searchData.tasks?.length > 0) {
      searchData.tasks.forEach(
        (task: NonNullable<SearchResponse>["tasks"][0]) => {
          items.push({
            id: `task-${task.id}`,
            label: task.title,
            icon: FileText,
            action: () => navigateToTask(task.id),
            subtitle: `${task.displayId} • ${task.projectName}`,
            badge: task.status,
            type: "task",
          });
        },
      );
    }

    // Add projects
    if (searchData.projects?.length > 0) {
      searchData.projects.forEach(
        (project: NonNullable<SearchResponse>["projects"][0]) => {
          items.push({
            id: `project-${project.id}`,
            label: project.name,
            icon: FolderOpen,
            action: () => navigateToProject(project.id),
            subtitle: project.code,
            type: "project",
          });
        },
      );
    }

    return items;
  }, [searchData, navigateToTask, navigateToProject]);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    return filterCommands(commands, search);
  }, [commands, search]);

  // Combine all items for navigation
  const allItems = useMemo<MenuItem[]>(() => {
    if (search.length < 2) {
      return filteredCommands;
    }
    return [...filteredCommands, ...searchResults];
  }, [filteredCommands, searchResults, search.length]);

  // Keyboard shortcuts to open command menu (Cmd/Ctrl+K or `/` when not typing)
  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      );
    };

    const down = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      const isModK = e.key === "k" && (e.metaKey || e.ctrlKey);
      const isSlash = e.key === "/";

      if ((isModK || isSlash) && !open) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", down, { capture: true });
    return () =>
      document.removeEventListener("keydown", down, { capture: true });
  }, [open]);

  // Allow other components to open the command menu (e.g., header button)
  useEffect(() => {
    const handleOpenEvent = () => setOpen(true);
    window.addEventListener("command-menu:open", handleOpenEvent);
    return () =>
      window.removeEventListener("command-menu:open", handleOpenEvent);
  }, []);

  // Focus the search input when the menu opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Keyboard navigation inside the command list
  useEffect(() => {
    if (!open) return;
    if (allItems.length === 0) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % allItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 < 0 ? allItems.length - 1 : i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        allItems[activeIndex]?.action();
      }
    };

    document.addEventListener("keydown", handler, { capture: true });
    return () =>
      document.removeEventListener("keydown", handler, { capture: true });
  }, [open, allItems, activeIndex]);

  const hasSearchResults =
    search.length >= 2 && !isSearchLoading && searchResults.length > 0;
  const showNoResults =
    search.length >= 2 && !isSearchLoading && allItems.length === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogOverlay className="backdrop-blur-sm bg-background/80" />
      <DialogContent
        className="overflow-hidden p-0 shadow-2xl bg-card"
        showCloseButton={false}
      >
        <div className="flex items-center border-b px-3" dir="ltr">
          <IconSearch
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex h-12 w-full rounded-md bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={commandMenu.labels.placeholder}
            role="combobox"
            aria-expanded={open}
            aria-controls="command-menu-listbox"
            aria-autocomplete="list"
            aria-activedescendant={
              allItems.length > 0 ? allItems[activeIndex]?.id : undefined
            }
            aria-label={
              commandMenu.ariaLabels?.searchInput ??
              commandMenu.ariaLabels.searchInput
            }
          />
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 border-border bg-muted text-muted-foreground">
            <span className="text-xs">{commandMenu.shortcuts.commandK}</span>
          </kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {isSearchLoading && search.length >= 2 && (
            <div className="flex flex-col items-center justify-center py-8">
              <IconSearch className="text-muted-foreground/40 size-6 animate-pulse" />
            </div>
          )}
          {showNoResults && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              {commandMenu.labels.noResults}
            </p>
          )}
          {allItems.length > 0 && (
            <div
              className="flex flex-col gap-1"
              dir="rtl"
              role="listbox"
              id="command-menu-listbox"
              aria-label={commandMenu.ariaLabels.commandList}
            >
              {allItems.map((item: MenuItem, idx: number) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    id={item.id}
                    type="button"
                    role="option"
                    aria-selected={idx === activeIndex}
                    onClick={item.action}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      idx === activeIndex && "bg-accent/20",
                    )}
                    data-active={idx === activeIndex}
                    tabIndex={idx === activeIndex ? 0 : -1}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                      <Icon
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground",
                          item.type === "task" && "text-muted-foreground",
                        )}
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col items-start">
                      <span className="truncate font-medium">{item.label}</span>
                      {"subtitle" in item && item.subtitle && (
                        <span className="text-muted-foreground truncate text-xs">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                    {"badge" in item && item.badge && (
                      <Badge
                        variant="secondary"
                        className="rounded px-1.5 py-0.5 text-[10px]"
                      >
                        {item.badge}
                      </Badge>
                    )}

                    {item.type === "command" &&
                      "shortcut" in item &&
                      item.shortcut && (
                        <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center rounded border px-1.5 font-mono text-[10px] border-border bg-muted text-muted-foreground">
                          {item.shortcut}
                        </kbd>
                      )}
                    {item.type === "task" && (
                      <IconTarget className="size-3 shrink-0 text-muted-foreground/50" />
                    )}
                    {item.type === "project" && (
                      <IconHash className="size-3 shrink-0 text-muted-foreground/50" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {search.length >= 2 && (
          <div className="flex items-center justify-between border-t px-4 py-2 text-[10px] border-border text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>{commandMenu.navigationInstructions.upDown}</span>
              <span>{commandMenu.navigationInstructions.enter}</span>
              <span>{commandMenu.navigationInstructions.escape}</span>
            </div>
            {hasSearchResults && (
              <span>
                {searchResults.length}{" "}
                {searchResults.length !== 1
                  ? commandMenu.navigationInstructions.results
                  : commandMenu.navigationInstructions.result}
              </span>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
