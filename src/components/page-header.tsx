import type { Icon as TablerIcon } from "@tabler/icons-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

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
   * Optional action buttons or elements
   */
  actions?: ReactNode;
  /**
   * Optional custom className
   */
  className?: string;
};

type PageHeaderProps = BasePageHeaderProps & {
  /**
   * @deprecated Use `subtitle` instead
   */
  description?: ReactNode;
};

// ============================================================================
// Main Component
// ============================================================================

function ProductCompactPageHeader({
  title,
  subtitle,
  description,
  eyebrow,
  icon: Icon,
  actions,
  className,
}: PageHeaderProps) {
  const subtitleNode = subtitle ?? description;
  const isInlineSubtitle =
    typeof subtitleNode === "string" || typeof subtitleNode === "number";

  return (
    <div className={cn("mb-4", className)}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-right">
            <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight md:text-lg">
                  {title}
                </h1>
                {eyebrow && (
                  <div className="text-muted-foreground text-[10px] font-semibold opacity-70">
                    {eyebrow}
                  </div>
                )}
              </div>
              {subtitleNode ? (
                isInlineSubtitle ? (
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed font-medium">
                    {subtitleNode}
                  </p>
                ) : (
                  <div className="text-muted-foreground mt-1 text-xs leading-relaxed font-medium">
                    {subtitleNode}
                  </div>
                )
              ) : null}
            </div>
          </div>

          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * PageHeader - Standardized page header component
 */
export function PageHeader(props: PageHeaderProps) {
  return <ProductCompactPageHeader {...props} />;
}

// ============================================================================
// Exports
// ============================================================================

export type { PageHeaderProps, PageHeaderVariant };
