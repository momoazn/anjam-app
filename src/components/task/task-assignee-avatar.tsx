import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

type AssigneeUser = {
  displayName?: string;
  email?: string;
  image?: string;
};

type TaskAssigneeAvatarProps = {
  /** The expanded assignee record from the task */
  assignee?: AssigneeUser | null;
  /** Whether the task has an assignee ID but no expanded record */
  hasAssigneeId?: boolean;
  /** Avatar size className (defaults to size-8) */
  size?: "sm" | "md" | "lg";
  /** Additional className for the wrapper */
  className?: string;
  /** Show online/active indicator dot (defaults to true) */
  showIndicator?: boolean;
  /** Custom indicator className for positioning/styling */
  indicatorClassName?: string;
};

const sizeClasses = {
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
} as const;

const indicatorSizeClasses = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-2.5",
} as const;

/**
 * A reusable task assignee avatar component with an optional online indicator.
 * Handles the common pattern of displaying assignee avatars in task lists and boards.
 *
 * @example
 * ```tsx
 * <TaskAssigneeAvatar
 *   assignee={task.expand?.assignee}
 *   hasAssigneeId={!!task.assignee}
 *   size="md"
 * />
 * ```
 */
export function TaskAssigneeAvatar({
  assignee,
  hasAssigneeId = false,
  size = "md",
  className,
  showIndicator = true,
  indicatorClassName,
}: TaskAssigneeAvatarProps) {
  // Convert assignee to the format expected by UserAvatar
  const userProps = assignee
    ? {
        displayName: assignee.displayName,
        email: assignee.email,
        image: assignee.image,
        _id: "",
      }
    : undefined;

  return (
    <div className={cn("relative", className)}>
      <UserAvatar
        user={userProps}
        showUnassigned={!assignee && !hasAssigneeId}
        className={cn(
          sizeClasses[size],
          "rounded-full border shadow-sm",
          size === "lg" && "border-2",
        )}
      />
      {showIndicator && assignee && (
        <div
          className={cn(
            "bg-primary border-background absolute -right-0.5 -bottom-0.5 rounded-full border-2",
            indicatorSizeClasses[size],
            indicatorClassName,
          )}
        />
      )}
    </div>
  );
}
