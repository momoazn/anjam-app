import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  };
};

export function UserAvatar({ user, username }: UserAvatarProps) {
  if (username) {
    return (
      <Avatar className="ring-sidebar-border/10 h-10 w-10 ring-2">
        <AvatarFallback className="bg-sidebar/30 text-sidebar-foreground font-semibold">
          {getUserInitials({ username })}
        </AvatarFallback>
      </Avatar>
    );
  }

  if (!user) {
    return (
      <Avatar className="ring-sidebar-border/10 h-10 w-10 ring-2">
        <AvatarFallback className="bg-sidebar/30 text-sidebar-foreground font-semibold">
          ?
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className="ring-sidebar-border/10 h-10 w-10 ring-2">
      <AvatarImage src={user.avatar} className="object-cover" />
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
