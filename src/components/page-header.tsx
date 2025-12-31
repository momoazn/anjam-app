import type { Icon as TablerIcon } from "@tabler/icons-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { BlueprintPattern } from "@/components/design-system/blueprint-pattern";
import type { IconBoxSize, IconBoxTone } from "@/components/recipes/icon-box";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ============================================================================
// Helper Component
// ============================================================================

function PageIconBox({
  icon: Icon,
  size = "md",
  tone = "primary",
}: {
  icon: IconType;
  size?: IconBoxSize;
  tone?: IconBoxTone;
}) {
  const sizeClasses: Record<IconBoxSize, string> = {
    xs: "h-10 w-10",
    sm: "h-12 w-12",
    md: "h-14 w-14",
    lg: "h-16 w-16",
  };

  const iconSizeClasses: Record<IconBoxSize, string> = {
    xs: "size-5",
    sm: "size-6",
    md: "size-7",
    lg: "size-8",
  };

  const toneClasses: Record<IconBoxTone, string> = {
    primary: "bg-primary/10 text-primary",
    primarySolid:
      "bg-primary text-primary-foreground shadow-primary/20 shadow-lg",
    muted: "bg-muted/50 text-muted-foreground",
    accent: "bg-accent text-accent-foreground",
    custom: "",
  };

  const isTablerIcon = Icon.displayName?.startsWith("Icon");

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-2xl",
        "transition-all duration-300 ease-out",
        sizeClasses[size],
        toneClasses[tone],
      )}
    >
      <Icon
        className={cn(iconSizeClasses[size], !isTablerIcon && "stroke-[1.5]")}
      />
    </div>
  );
}

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
 * Default PageHeader - Standard card wrapper with icon, title, subtitle
 *
 * Used for: Most list/detail pages (users, tags, settings, etc.)
 */
function DefaultPageHeader({
  title,
  subtitle,
  description,
  icon: Icon,
  iconSize = "md",
  iconTone = "primary",
  actions,
  className,
}: PageHeaderProps) {
  return (
    <Card
      className={cn(
        "border-border bg-card relative mb-8 overflow-hidden rounded-xl border shadow-sm",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5 text-right">
            <PageIconBox icon={Icon} size={iconSize} tone={iconTone} />
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
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

/**
 * Hero PageHeader - Large, impactful header for main sections
 *
 * Used for: Projects page, main landing pages
 */
function HeroPageHeader({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  iconSize = "lg",
  iconTone = "primary",
  actions,
  background,
  className,
}: PageHeaderProps) {
  return (
    <Card
      className={cn(
        "border-border/10 relative mb-12 overflow-hidden border shadow-sm",
        "rounded-3xl",
        className,
      )}
    >
      {background ?? (
        <BlueprintPattern variant="dots" className="opacity-[0.02]" />
      )}

      <CardContent className="relative z-10 flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between lg:p-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <PageIconBox icon={Icon} size={iconSize} tone={iconTone} />
            <div className="flex flex-col">
              {eyebrow}
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                {title}
              </h1>
            </div>
          </div>

          {subtitle && (
            <p className="text-muted-foreground/60 max-w-md text-sm leading-relaxed font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div>{actions}</div>}
      </CardContent>
    </Card>
  );
}

/**
 * Minimal PageHeader - No card wrapper, simple layout
 *
 * Used for: Simple pages, sub-pages, settings sub-pages
 */
function MinimalPageHeader({
  title,
  subtitle,
  description,
  icon: Icon,
  iconSize = "sm",
  iconTone = "primary",
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "border-border/40 mb-8 flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <PageIconBox icon={Icon} size={iconSize} tone={iconTone} />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {(subtitle || description) && (
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              {subtitle ?? description}
            </p>
          )}
        </div>
      </div>

      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Toolbar PageHeader - Toolbar-style with multiple action buttons
 *
 * Used for: Tasks page, pages with many actions/filters
 */
function ToolbarPageHeader({
  title,
  subtitle,
  description,
  eyebrow,
  icon: Icon,
  iconSize = "lg",
  iconTone = "primary",
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative mb-12 flex flex-col gap-8 border-b pb-12 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <BlueprintPattern variant="technical" className="opacity-[0.03]" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <PageIconBox icon={Icon} size={iconSize} tone={iconTone} />
          <div className="flex flex-col">
            {eyebrow}
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {title}
            </h1>
          </div>
        </div>

        {(subtitle || description) && (
          <p className="text-muted-foreground/60 max-w-md text-sm leading-relaxed font-medium">
            {subtitle ?? description}
          </p>
        )}
      </div>

      {actions && (
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * Breadcrumb PageHeader - With breadcrumb trail
 *
 * Used for: Detail pages, nested pages
 */
function BreadcrumbPageHeader({
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
    <div className={cn("mb-8", className)}>
      {/* Breadcrumb */}
      {eyebrow && <div className="mb-4">{eyebrow}</div>}

      <Card className="relative overflow-hidden">
        <CardContent className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <PageIconBox icon={Icon} size={iconSize} tone={iconTone} />
                <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
                  {title}
                </h1>
              </div>

              {(subtitle || description) && (
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  {subtitle ?? description}
                </p>
              )}
            </div>

            {actions && (
              <div className="flex items-center gap-2 pt-4 md:pt-0">
                {actions}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * PageHeader - Standardized page header component
 *
 * @example Default variant (most common)
 * ```tsx
 * <PageHeader
 *   title="Users"
 *   description="Manage your team members"
 *   icon={IconUsers}
 *   actions={<Button>Create User</Button>}
 * />
 * ```
 *
 * @example Hero variant (main pages)
 * ```tsx
 * <PageHeader
 *   variant="hero"
 *   title="Projects"
 *   subtitle="10 active projects"
 *   icon={Target}
 *   iconTone="primarySolid"
 *   action={<Button>New Project</Button>}
 * />
 * ```
 *
 * @example Minimal variant (sub-pages)
 * ```tsx
 * <PageHeader
 *   variant="minimal"
 *   title="Preferences"
 *   subtitle="Customize your experience"
 *   icon={IconSettings}
 * />
 * ```
 *
 * @example Toolbar variant (pages with many actions)
 * ```tsx
 * <PageHeader
 *   variant="toolbar"
 *   title="All Tasks"
 *   subtitle="50 tasks found"
 *   icon={ListTodo}
 *   eyebrow={<Breadcrumb />}
 *   actions={<><Button /><Button /></>}
 * />
 * ```
 *
 * @example Breadcrumb variant (detail pages)
 * ```tsx
 * <PageHeader
 *   variant="breadcrumb"
 *   title="Task Details"
 *   subtitle={task.title}
 *   icon={IconHash}
 *   eyebrow={<Breadcrumb />}
 *   actions={<><Button /><Button /></>}
 * />
 * ```
 */
export function PageHeader({ variant = "default", ...props }: PageHeaderProps) {
  switch (variant) {
    case "hero":
      return <HeroPageHeader {...props} />;
    case "minimal":
      return <MinimalPageHeader {...props} />;
    case "toolbar":
      return <ToolbarPageHeader {...props} />;
    case "breadcrumb":
      return <BreadcrumbPageHeader {...props} />;
    default:
      return <DefaultPageHeader {...props} />;
  }
}

// ============================================================================
// Exports
// ============================================================================

export type { PageHeaderProps, PageHeaderVariant };
