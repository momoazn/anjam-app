/**
 * React hook for applying Linear Design System theme
 * based on current organization mode.
 */
import { useEffect } from "react";

import {
  applyModeTheme,
  getLinearClasses,
  isLinearThemeActive,
} from "@/lib/mode-theme";
import { useCurrentOrgMode } from "@/store/auth-store";

/**
 * Hook to automatically apply Linear theme to document body
 * when organization mode changes.
 *
 * Should be called once in the root App component.
 */
export function useLinearThemeEffect() {
  const mode = useCurrentOrgMode();

  useEffect(() => {
    applyModeTheme(mode);
  }, [mode]);
}

/**
 * Hook to get Linear-specific class names for components.
 *
 * @example
 * const classes = useLinearClasses();
 * <div className={cn("bg-card", classes.surface)}>
 */
export function useLinearClasses() {
  const mode = useCurrentOrgMode();
  return getLinearClasses(mode);
}

/**
 * Hook to check if Linear theme is currently active.
 *
 * @example
 * const isLinear = useIsLinearTheme();
 * {isLinear && <LinearSpecificComponent />}
 */
export function useIsLinearTheme() {
  const mode = useCurrentOrgMode();
  return isLinearThemeActive(mode);
}
