import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { isFeatureEnabled } from "@/lib/mode";
import { useCurrentOrgFeatures, useCurrentOrgMode } from "@/store/auth-store";

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

      // "?" for keyboard shortcuts help (future)
      if (normalizedKey === "shift+/" && !e.repeat) {
        // Keyboard shortcuts help - in future, this could open a modal
        // For now, this is a no-op placeholder
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
    // Ref objects are stable and don't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
