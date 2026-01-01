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
        "border-border bg-card relative mb-6 overflow-hidden rounded-xl border shadow-sm",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5 text-right">
            <div className="flex shrink-0">
              <IconBox size={iconSize} tone={iconTone}>
                <Icon className="size-full p-1" />
              </IconBox>{" "}
            </div>
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
        "border-border/10 relative mb-8 overflow-hidden border shadow-sm",
        "rounded-3xl",
        className,
      )}
    >
      {background}

      <CardContent className="relative z-10 flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between lg:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <IconBox size={iconSize} tone={iconTone}>
              <Icon className="size-full p-1" />
            </IconBox>{" "}
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
        "border-border/40 mb-6 flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <IconBox size={iconSize} tone={iconTone}>
          <Icon className="size-full p-1" />
        </IconBox>{" "}
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
        "relative mb-6 flex flex-col gap-8 border-b pb-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <IconBox size={iconSize} tone={iconTone}>
            <Icon className="size-full p-1" />
          </IconBox>{" "}
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
    <div className={cn("mb-6", className)}>
      {/* Breadcrumb */}
      {eyebrow && <div className="mb-4">{eyebrow}</div>}

      <Card className="relative overflow-hidden">
        <CardContent className="relative z-10 p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <IconBox size={iconSize} tone={iconTone}>
                  <Icon className="size-full p-1" />
                </IconBox>{" "}
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
