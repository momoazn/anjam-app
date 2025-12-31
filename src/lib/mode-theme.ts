/**
 * Mode Theme Module
 *
 * Provides utilities for applying mode-specific theming
 * based on the current organization mode.
 */
import type { OrgMode } from "./mode-features";

/**
 * Apply product theme class to document body when in product mode
 * Removes the class when in operations mode
 *
 * @param mode Current organization mode
 */
export function applyModeTheme(mode: OrgMode | null | undefined): void {
  if (typeof document === "undefined") return;

  const body = document.body;

  if (mode === "product") {
    body.classList.add("product-theme");
  } else {
    body.classList.remove("product-theme");
  }
}

/**
 * Check if product theme should be applied
 *
 * @param mode Current organization mode
 * @returns true if product theme is active
 */
export function isProductThemeActive(
  mode: OrgMode | null | undefined,
): boolean {
  return mode === "product";
}

/**
 * Get mode-specific CSS class names
 *
 * @param mode Current organization mode
 * @returns Object with conditional class names for product theming
 */
export function getProductClasses(mode: OrgMode | null | undefined) {
  const isProduct = isProductThemeActive(mode);

  return {
    canvas: isProduct ? "product-canvas" : "",
    surface: isProduct ? "product-surface" : "",
    elevated: isProduct ? "product-elevated" : "",
    beveled: isProduct ? "product-beveled" : "",
    selected: isProduct ? "product-selected" : "",
    transition: isProduct ? "product-transition" : "",
    kbdFocus: isProduct ? "product-kbd-focus" : "",
    glass: isProduct ? "product-glass" : "",
  };
}
