import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fa } from "@/constants/text";
import { pb } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";

function getUserInitials({
  first_name,
  last_name,
  username,
}: {
  first_name?: string;
  last_name?: string;
  username?: string;
}) {
  if (first_name && last_name) {
    return `${first_name.substring(0, 1)}${last_name.substring(0, 1)}`.toUpperCase();
  }
  if (username) {
    return username.substring(0, 2).toUpperCase();
  }
  return "?";
}

type UserAvatarProps = {
  username?: string;
  user?: {
    first_name?: string;
    last_name?: string;
    username?: string;
    avatar?: string;
    id?: string;
    collectionId?: string;
    collectionName?: string;
  };
  showUnassigned?: boolean;
  className?: string;
};

function getAvatarUrl(user: UserAvatarProps["user"]) {
  if (!user || !user.avatar) return undefined;

  const avatar = user.avatar;

  // If avatar already looks like a full URL or blob/data URL, use it as-is
  if (
    avatar.startsWith("http://") ||
    avatar.startsWith("https://") ||
    avatar.startsWith("blob:") ||
    avatar.startsWith("data:")
  ) {
    return avatar;
  }

  // If we have a PocketBase record shape, build the file URL
  if (user.id && (user.collectionId || user.collectionName)) {
    try {
      // We only need id/collection and avatar here; pb will handle the rest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return pb.files.getUrl(user as any, avatar);
    } catch {
      // Fall through to returning the raw value if something goes wrong
    }
  }

  // Fallback: return the raw avatar value (may still work if it's a relative path)
  return avatar;
}

export function UserAvatar({
  user,
  username,
  showUnassigned = false,
  className,
}: UserAvatarProps) {
  const avatarClassName = cn(
    "ring-sidebar-border/10 ring-2",
    className || "h-10 w-10",
  );

  // If we have a user object, use it
  if (user) {
    const avatarUrl = getAvatarUrl(user);

    return (
      <Avatar className={avatarClassName}>
        <AvatarImage src={avatarUrl} className="object-cover" />
        <AvatarFallback className="bg-sidebar/30 text-sidebar-foreground text-sm font-semibold">
          {getUserInitials({
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
          })}
        </AvatarFallback>
      </Avatar>
    );
  }

  // If we have a username (even if it's an ID), show initials
  if (username) {
    return (
      <Avatar className={avatarClassName}>
        <AvatarFallback className="bg-sidebar/30 text-sidebar-foreground font-semibold">
          {getUserInitials({ username })}
        </AvatarFallback>
      </Avatar>
    );
  }

  // Show unassigned indicator if explicitly requested
  if (showUnassigned) {
    return (
      <Avatar className={avatarClassName}>
        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
          {fa.tasks.addTask.unassigned}
        </AvatarFallback>
      </Avatar>
    );
  }

  // Fallback for no data
  return (
    <Avatar className={avatarClassName}>
      <AvatarFallback className="bg-sidebar/30 text-sidebar-foreground font-semibold">
        ?
      </AvatarFallback>
    </Avatar>
  );
}
