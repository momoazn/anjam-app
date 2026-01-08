// Design System Components
// Centralized reusable components following Industrial Editorial aesthetic

export { SpringCard, SpringButton } from "@/components/ui/spring-interactions";

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

  // Border radius (rounded corners)
  radius: {
    none: "0rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
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
  hoverScale: "hover:scale-[1.01] active:scale-[0.99]",
  hoverGlow: "hover:shadow-primary/10",
  hoverRotate: "hover:rotate-[0.5deg]",

  // Technical typography
  technicalTitle: "text-lg font-bold tracking-tight",
  technicalSubtitle: "text-sm text-muted-foreground",
};
