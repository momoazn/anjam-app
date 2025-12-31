/**
 * React hook for applying mode-specific theme
 * based on current organization mode.
 */
import { useEffect } from "react";

import {
  applyModeTheme,
  getProductClasses,
  isProductThemeActive,
} from "@/lib/mode-theme";
import { useCurrentOrgMode } from "@/store/auth-store";

/**
 * Hook to automatically apply product theme to document body
 * when organization mode changes.
 *
 * Should be called once in the root App component.
 */
export function useProductThemeEffect() {
  const mode = useCurrentOrgMode();

  useEffect(() => {
    applyModeTheme(mode);
  }, [mode]);
}

/**
 * Hook to get mode-specific class names for components.
 *
 * @example
 * const classes = useProductClasses();
 * <div className={cn("bg-card", classes.surface)}>
 */
export function useProductClasses() {
  const mode = useCurrentOrgMode();
  return getProductClasses(mode);
}

/**
 * Hook to check if product theme is currently active.
 *
 * @example
 * const isProduct = useIsProductTheme();
 * {isProduct && <ProductSpecificComponent />}
 */
export function useIsProductTheme() {
  const mode = useCurrentOrgMode();
  return isProductThemeActive(mode);
}
