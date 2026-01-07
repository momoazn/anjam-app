/**
 * React hook for applying mode-specific theme
 * Always applies product theme since we're in product-only mode.
 */
import { useEffect } from "react";

import { getProductClasses } from "@/lib/mode";

/**
 * Hook to automatically apply product theme to document body.
 * Should be called once in the root App component.
 */
export function useProductThemeEffect() {
  useEffect(() => {}, []);
}

/**
 * Hook to get mode-specific class names for components.
 *
 * @example
 * const classes = useProductClasses();
 * <div className={cn("bg-card", classes.surface)}>
 */
export function useProductClasses() {
  return getProductClasses();
}

/**
 * Hook to check if product theme is currently active.
 * Always returns true since we're in product-only mode.
 */
export function useIsProductTheme() {
  return true;
}
