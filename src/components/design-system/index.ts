// Design System Components
// Centralized reusable components following Industrial Editorial aesthetic

export { LFrame } from "./l-frame";
export { SpringCard, SpringButton } from "./spring-interactions";
export { BlueprintPattern, TechnicalHeader } from "./blueprint-pattern";

// Design utilities and constants
export const designTokens = {
  // Spring physics curves
  springs: {
    fast: "cubic-bezier(0.16, 1, 0.3, 1)",
    normal: "cubic-bezier(0.16, 1, 0.3, 1)",
    slow: "cubic-bezier(0.16, 1, 0.3, 1)",
  },

  // Durations
  durations: {
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
  },

  // Border radius (sharp corners)
  radius: {
    none: "0rem",
    sm: "0rem",
    md: "0rem",
    lg: "0rem",
  },

  // L-Frame sizes
  lFrame: {
    sm: { width: "0.5rem", height: "0.5rem" },
    md: { width: "0.75rem", height: "0.75rem" },
    lg: { width: "1rem", height: "1rem" },
  },

  // Pattern opacities
  patterns: {
    subtle: 0.03,
    medium: 0.05,
    strong: 0.08,
  },
};

// CSS class generators for consistent styling
export const designClasses = {
  // Spring transitions
  spring: (variant: "fast" | "normal" | "slow" = "normal") => {
    const duration = {
      fast: "150ms",
      normal: "200ms",
      slow: "300ms",
    }[variant];

    return `transition-all duration-${duration} ease-[cubic-bezier(0.16,1,0.3,1)]`;
  },

  // Hover effects
  hoverScale: "hover:scale-[1.02] active:scale-[0.98]",
  hoverGlow: "hover:shadow-primary/20",
  hoverRotate: "hover:rotate-[1deg]",

  // L-Frame variants
  lFrameCorners: "relative overflow-hidden rounded-none",
  lFrameBorder: "border-b-2 border-l-2 border-border/15",

  // Technical typography
  technicalLabel:
    "text-[8px] font-black tracking-tight uppercase text-muted-foreground/60",
  technicalTitle: "text-lg font-black tracking-tight uppercase",
  technicalSubtitle: "text-sm text-muted-foreground",
};
