import type { Icon as TablerIcon } from "@tabler/icons-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  IconBox,
  type IconBoxSize,
  type IconBoxTone,
} from "@/components/ui/icon-box";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

type PageHeaderVariant =
  | "default" // Standard card header
  | "hero" // Large, impactful header for main pages
  | "minimal" // Minimal header without card wrapper
  | "toolbar" // Toolbar-style header with multiple actions
  | "breadcrumb"; // Header with breadcrumb trail

type IconType = TablerIcon | LucideIcon;

type BasePageHeaderProps = {
  /**
   * Page title (main heading)
   */
  title: ReactNode;
  /**
   * Optional subtitle or description
   */
  subtitle?: ReactNode;
  /**
   * Optional eyebrow text (small label above title)
   */
  eyebrow?: ReactNode;
  /**
   * Icon to display
   */
  icon: IconType;
  /**
   * Icon box size
   * @default "md" for default, "lg" for hero, "sm" for minimal
   */
  iconSize?: IconBoxSize;
  /**
   * Icon box tone/color
   * @default "primary"
   */
  iconTone?: IconBoxTone;
  /**
   * Optional action buttons or elements
   */
  actions?: ReactNode;
  /**
   * Optional custom background element
   */
  background?: ReactNode;
  /**
   * Optional custom className
   */
  className?: string;
  /**
   * Visual variant of the header
   * @default "default"
   */
  variant?: PageHeaderVariant;
};

type PageHeaderProps = BasePageHeaderProps & {
  /**
   * @deprecated Use `subtitle` instead
   */
  description?: ReactNode;
};

// ============================================================================
// Variants
// ============================================================================

/**
 * Standard PageHeader - Unified component for all pages
 */
function StandardPageHeader({
  title,
  subtitle,
  description,
  eyebrow,
  icon: Icon,
  iconSize = "md",
  iconTone = "primary",
  actions,
  className,
}: PageHeaderProps) {
  return (
    <Card
      className={cn(
        "border-border bg-card relative mb-6 overflow-hidden rounded-xl border shadow-sm",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 text-right">
            <div className="flex shrink-0">
              <IconBox size={iconSize} tone={iconTone}>
                <Icon className="size-full p-1" />
              </IconBox>{" "}
            </div>
            <div className="flex flex-col justify-center">
              {eyebrow && <div className="mb-1">{eyebrow}</div>}
              <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                {title}
              </h1>
              {(subtitle || description) && (
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed font-medium">
                  {subtitle ?? description}
                </p>
              )}
            </div>
          </div>

          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * PageHeader - Standardized page header component
 */
export function PageHeader(props: PageHeaderProps) {
  return <StandardPageHeader {...props} />;
}

// ============================================================================
// Exports
// ============================================================================

export type { PageHeaderProps, PageHeaderVariant };
