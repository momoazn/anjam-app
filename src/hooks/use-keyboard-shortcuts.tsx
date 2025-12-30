import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCurrentOrgMode, useCurrentOrgFeatures } from "@/store/auth-store";
import { isFeatureEnabled } from "@/lib/mode-features";

/**
 * Parse a keyboard event into a normalized key string
 */
function normalizeKeyEvent(e: KeyboardEvent): string {
  const parts: string[] = [];

  if (e.metaKey || e.ctrlKey) parts.push("mod");
  if (e.shiftKey) parts.push("shift");
  if (e.altKey) parts.push("alt");

  // Normalize key
  let key = e.key.toLowerCase();
  if (key === " ") key = "space";

  parts.push(key);

  return parts.join("+");
}

/**
 * Hook for registering global keyboard shortcuts
 *
 * Product mode shortcuts (Linear-inspired):
 * - g + i: Go to Inbox
 * - g + p: Go to Issues (or Projects?)
 * - c: Create new issue
 * - /: Focus search (when not in input)
 *
 * Operations mode shortcuts:
 * - g + d: Go to Dashboard
 * - g + t: Go to Tasks
 * - c: Create new task
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = useCurrentOrgMode();
  const features = useCurrentOrgFeatures();

  // Track "g" prefix for vim-style navigation
  const goPrefixTimeoutRef = { current: null as NodeJS.Timeout | null };
  const goPrefixActiveRef = { current: false };

  const isInputFocused = useCallback(() => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;

    const tagName = activeElement.tagName.toLowerCase();
    if (tagName === "input" || tagName === "textarea" || tagName === "select") {
      return true;
    }

    // Check for contenteditable
    if (activeElement.getAttribute("contenteditable") === "true") {
      return true;
    }

    return false;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (isInputFocused()) return;

      const normalizedKey = normalizeKeyEvent(e);

      // Handle "g" prefix for navigation
      if (normalizedKey === "g" && !e.repeat) {
        goPrefixActiveRef.current = true;
        if (goPrefixTimeoutRef.current) {
          clearTimeout(goPrefixTimeoutRef.current);
        }
        goPrefixTimeoutRef.current = setTimeout(() => {
          goPrefixActiveRef.current = false;
        }, 500); // 500ms window for second key
        return;
      }

      // Handle second key after "g"
      if (goPrefixActiveRef.current) {
        goPrefixActiveRef.current = false;
        if (goPrefixTimeoutRef.current) {
          clearTimeout(goPrefixTimeoutRef.current);
        }

        // Product mode navigation
        if (mode === "product") {
          switch (e.key.toLowerCase()) {
            case "i":
              e.preventDefault();
              navigate("/inbox");
              return;
            case "s":
              e.preventDefault();
              navigate("/issues");
              return;
            case "p":
              e.preventDefault();
              navigate("/projects");
              return;
            case "n":
              e.preventDefault();
              navigate("/insights");
              return;
            case "v":
              e.preventDefault();
              navigate("/views");
              return;
          }
        } else {
          // Operations mode navigation
          switch (e.key.toLowerCase()) {
            case "d":
              e.preventDefault();
              navigate("/dashboard");
              return;
            case "t":
              e.preventDefault();
              navigate("/tasks");
              return;
            case "m":
              e.preventDefault();
              navigate("/my-tasks");
              return;
            case "p":
              e.preventDefault();
              navigate("/projects");
              return;
            case "r":
              if (isFeatureEnabled(features, "reports")) {
                e.preventDefault();
                navigate("/reports");
              }
              return;
            case "s":
              if (isFeatureEnabled(features, "timesheet")) {
                e.preventDefault();
                navigate("/timesheet");
              }
              return;
          }
        }
      }

      // Single key shortcuts (not after "g")

      // "c" to create new task/issue
      if (normalizedKey === "c" && !e.repeat) {
        e.preventDefault();
        // Navigate to create task, preserving project context if on project page
        if (location.pathname.match(/^\/projects\/[^/]+/)) {
          const projectId = location.pathname.split("/")[2];
          navigate(`/projects/${projectId}/tasks/new`);
        } else {
          navigate("/tasks/new");
        }
        return;
      }

      // "/" to focus search (common pattern)
      if (normalizedKey === "/" && !e.repeat) {
        e.preventDefault();
        // Try to find and focus search input
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"], input[placeholder*="search"], input[placeholder*="Search"], input[name="search"]',
        );
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      // "?" for keyboard shortcuts help (future)
      if (normalizedKey === "shift+/" && !e.repeat) {
        // Could open a keyboard shortcuts modal
        // For now, just log available shortcuts
        console.log("Keyboard shortcuts available:");
        console.log(
          "g + i/s/p/n/v: Navigate (Inbox/Issues/Projects/iNsights/Views) [product mode]",
        );
        console.log(
          "g + d/t/m/p/r/s: Navigate (Dashboard/Tasks/My-tasks/Projects/Reports/timeSheet) [operations mode]",
        );
        console.log("c: Create new task/issue");
        console.log("/: Focus search");
        return;
      }

      // Escape to close modals/dialogs (handled by Radix, but we can do additional cleanup)
      if (normalizedKey === "escape") {
        // Blur any focused input
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (goPrefixTimeoutRef.current) {
        clearTimeout(goPrefixTimeoutRef.current);
      }
    };
  }, [navigate, mode, features, isInputFocused, location.pathname]);
}

/**
 * Hook to enable keyboard shortcuts globally
 * Should be called once in the app root
 */
export function KeyboardShortcutsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useKeyboardShortcuts();
  return <>{children}</>;
}
