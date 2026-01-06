import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { tasks } from "@/constants";
import { cn, getUserInitials } from "@/lib/utils";

type UserAvatarProps = {
  username?: string;
  user?: {
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    username?: string;
    avatar?: string;
    id?: string;
    _id?: string;
  };
  showUnassigned?: boolean;
  className?: string;
};

function getAvatarUrl(user: UserAvatarProps["user"]) {
  if (!user || !user.avatar) return undefined;

  const avatar = user.avatar;

  // In Convex, avatars are typically stored as storage IDs or full URLs.
  // If it's a full URL or blob/data URL, use it as-is.
  if (
    avatar.startsWith("http://") ||
    avatar.startsWith("https://") ||
    avatar.startsWith("blob:") ||
    avatar.startsWith("data:")
  ) {
    return avatar;
  }

  // Fallback: return the raw avatar value.
  // Note: For Convex storage IDs, the caller should ideally resolve them to URLs via useQuery(api.storage.getUrl, ...)
  return avatar;
}

function getFirstName(user: UserAvatarProps["user"]): string | undefined {
  return user?.firstName ?? user?.first_name;
}

function getLastName(user: UserAvatarProps["user"]): string | undefined {
  return user?.lastName ?? user?.last_name;
}

export function UserAvatar({
  user,
  username,
  showUnassigned = false,
  className,
}: UserAvatarProps) {
  const avatarClassName = cn(
    "ring-background ring-2",
    className || "h-10 w-10",
  );

  // If we have a user object, use it
  if (user) {
    const avatarUrl = getAvatarUrl(user);

    return (
      <Avatar className={avatarClassName}>
        <AvatarImage src={avatarUrl} className="object-cover" />
        <AvatarFallback className="bg-muted text-muted-foreground text-sm font-semibold">
          {getUserInitials(getFirstName(user), getLastName(user), user.username)}
        </AvatarFallback>
      </Avatar>
    );
  }

  // If we have a username (even if it's an ID), show initials
  if (username) {
    return (
      <Avatar className={avatarClassName}>
        <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
          {getUserInitials(undefined, undefined, username)}
        </AvatarFallback>
      </Avatar>
    );
  }

  // Show unassigned indicator if explicitly requested
  if (showUnassigned) {
    return (
      <Avatar className={avatarClassName}>
        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
          {tasks.addTask.unassigned}
        </AvatarFallback>
      </Avatar>
    );
  }

  // Fallback for no data
  return (
    <Avatar className={avatarClassName}>
      <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
        ?
      </AvatarFallback>
    </Avatar>
  );
}
