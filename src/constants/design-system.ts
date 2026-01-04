// Design System Constants
// Standardized values for consistent UI/UX across the application

// ============================================================================
// SPACING SYSTEM (4px base scale)
// ============================================================================
export const spacing = {
  // Base spacing unit
  base: "1rem", // 16px

  // Gap values
  gap: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "0.75rem", // 12px
    lg: "1rem", // 16px
    xl: "1.5rem", // 24px
    "2xl": "2rem", // 32px
    "3xl": "2.5rem", // 40px
  },

  // Padding values
  p: {
    xs: "0.5rem", // 8px
    sm: "0.75rem", // 12px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
  },

  // Section spacing (vertical spacing between sections)
  section: {
    sm: "1.5rem", // 24px - space-y-6
    md: "2rem", // 32px - space-y-8
    lg: "2.5rem", // 40px - space-y-10
  },
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================
export const typography = {
  // Font sizes
  size: {
    xs: "0.75rem", // 12px - text-xs
    sm: "0.875rem", // 14px - text-sm
    base: "1rem", // 16px - text-base
    lg: "1.125rem", // 18px - text-lg
    xl: "1.25rem", // 20px - text-xl
    "2xl": "1.5rem", // 24px - text-2xl
    "3xl": "1.875rem", // 30px - text-3xl
    "4xl": "2.25rem", // 36px - text-4xl
  },

  // Font weights
  weight: {
    normal: "400", // font-normal
    medium: "500", // font-medium
    semibold: "600", // font-semibold
    bold: "700", // font-bold
  },

  // Letter spacing
  tracking: {
    tight: "-0.025em", // tracking-tight
    normal: "0", // tracking-normal
    wide: "0.025em", // tracking-wide
  },

  // Line heights
  leading: {
    tight: "1.25", // leading-tight
    normal: "1.5", // leading-normal
    relaxed: "1.625", // leading-relaxed
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================
export const radius = {
  sm: "0.375rem", // rounded-sm
  md: "0.5rem", // rounded-md / rounded-lg
  lg: "0.75rem", // rounded-lg
  xl: "0.875rem", // rounded-xl
  "2xl": "1rem", // rounded-2xl
  full: "9999px", // rounded-full
} as const;

// ============================================================================
// SHADOWS
// ============================================================================
export const shadow = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)", // shadow-sm
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", // shadow-md
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", // shadow-lg
  none: "none", // shadow-none
} as const;

// ============================================================================
// BORDER
// ============================================================================
export const border = {
  // Border width
  width: {
    thin: "1px", // border
    medium: "2px", // border-2
  },

  // Border opacity
  opacity: {
    default: "1", // border-border
    subtle: "0.4", // border-border/40
    faint: "0.15", // border-border/15
  },
} as const;

// ============================================================================
// COMPONENT SIZES
// ============================================================================
export const size = {
  // Button sizes
  button: {
    sm: {
      height: "2rem", // h-8
      paddingX: "0.75rem", // px-3
      fontSize: "0.75rem", // text-xs
    },
    md: {
      height: "2.75rem", // h-11
      paddingX: "1.5rem", // px-6
      fontSize: "0.875rem", // text-sm
    },
    lg: {
      height: "3.5rem", // h-14
      paddingX: "1rem", // px-4
      fontSize: "1rem", // text-base
    },
  },

  // Input sizes
  input: {
    md: {
      height: "3rem", // h-12
      paddingX: "1rem", // px-4
      fontSize: "0.875rem", // text-sm
    },
  },

  // Card sizes
  card: {
    padding: {
      compact: "1rem", // p-4
      default: "2rem", // p-8
      spacious: "2.5rem", // p-10
    },
  },

  // Dialog sizes
  dialog: {
    padding: {
      header: "1.5rem", // px-6 py-4
      body: "1.5rem", // p-6
      footer: "1rem 1.5rem", // px-6 py-4
    },
  },
} as const;

// ============================================================================
// TAILWIND CLASS MAPS (for direct use in components)
// ============================================================================
export const tw = {
  // Spacing
  gap: {
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
    xl: "gap-6",
    "2xl": "gap-8",
  },

  // Button classes
  button: {
    size: {
      sm: "h-8 px-3 text-xs",
      md: "h-11 px-6 text-sm font-medium",
      lg: "h-14 px-4 text-base font-bold",
    },
    radius: "rounded-xl",
    base: "inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  },

  // Input classes
  input: {
    base: "h-12 w-full rounded-xl px-4 text-sm transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    radius: "rounded-xl",
  },

  // Form label classes
  label: {
    base: "text-xs font-bold tracking-tight text-muted-foreground",
  },

  // Form error classes
  error: {
    base: "text-[10px] font-bold text-destructive",
  },

  // Card classes
  card: {
    base: "rounded-xl border border-border bg-card",
    padding: {
      compact: "p-4",
      default: "p-8",
      spacious: "p-10",
    },
  },

  // Dialog classes
  dialog: {
    header:
      "flex flex-col space-y-1.5 text-center sm:text-left border-b px-6 py-4",
    title: "text-lg font-semibold leading-none tracking-tight",
    body: "p-6",
    footer:
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-6 py-4",
  },

  // Table cell classes
  table: {
    cell: "px-4 py-3 align-middle",
    cellHeader:
      "px-4 py-3 text-xs font-bold text-muted-foreground tracking-tight",
    row: "hover:bg-muted/30 transition-colors",
  },

  // Container max widths
  container: {
    default: "max-w-7xl",
    narrow: "max-w-3xl",
  },
} as const;
