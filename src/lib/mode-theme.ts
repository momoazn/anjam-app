/**
 * Mode Theme Module
 *
 * Provides utilities for applying Linear Design System theming
 * based on the current organization mode.
 */
import type { OrgMode } from "./mode-features";

/**
 * Apply Linear theme class to document body when in product mode
 * Removes the class when in operations mode
 *
 * @param mode Current organization mode
 */
export function applyModeTheme(mode: OrgMode | null | undefined): void {
  if (typeof document === "undefined") return;

  const body = document.body;

  if (mode === "product") {
    body.classList.add("linear-theme");
  } else {
    body.classList.remove("linear-theme");
  }
}

/**
 * Check if Linear theme should be applied
 *
 * @param mode Current organization mode
 * @returns true if Linear theme is active
 */
export function isLinearThemeActive(mode: OrgMode | null | undefined): boolean {
  return mode === "product";
}

/**
 * Get mode-specific CSS class names
 *
 * @param mode Current organization mode
 * @returns Object with conditional class names for Linear theming
 */
export function getLinearClasses(mode: OrgMode | null | undefined) {
  const isLinear = isLinearThemeActive(mode);

  return {
    canvas: isLinear ? "linear-canvas" : "",
    surface: isLinear ? "linear-surface" : "",
    elevated: isLinear ? "linear-elevated" : "",
    beveled: isLinear ? "linear-beveled" : "",
    selected: isLinear ? "linear-selected" : "",
    transition: isLinear ? "linear-transition" : "",
    kbdFocus: isLinear ? "linear-kbd-focus" : "",
    glass: isLinear ? "linear-glass" : "",
  };
}
