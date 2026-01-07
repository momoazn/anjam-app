export function getProductClasses() {
  return {
    canvas: "product-canvas",
    surface: "product-surface",
    elevated: "product-elevated",
    beveled: "product-beveled",
    selected: "product-selected",
    transition: "product-transition",
    kbdFocus: "product-kbd-focus",
    glass: "product-glass",
  };
}

export function getHomeRoute(): string {
  return "/inbox";
}

export const DEFAULT_TASK_STATUS = "todo" as const;
