import { IconLogout, IconUserCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { navigation, user as userLabels, users } from "@/constants";
import type { UsersRecord } from "@/lib/pocketbase-types";
import { useAuthActions, useAuthUser } from "@/store/auth-store";
import { UserAvatar } from "./user-avatar";

type UserInfoProps = {
  user: UsersRecord;
};

function UserInfo({ user }: UserInfoProps) {
  return (
    <>
      <div className="relative">
        <UserAvatar user={user} />
        {/* Online status indicator */}
        <div className="border-background absolute -end-0.5 -bottom-0.5 h-3 w-3 rounded-full border bg-green-500" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <span className="text-foreground truncate text-sm leading-tight font-semibold">
            {user.first_name} {user.last_name}
          </span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-muted-foreground truncate font-mono text-xs">
            @{user.username}
          </span>
          <span className="bg-muted-foreground/40 h-1 w-1 flex-shrink-0 rounded-full" />
          <span className="text-muted-foreground truncate text-xs">
            {users.table.roles[user.role as keyof typeof users.table.roles]}
          </span>
        </div>
      </div>
    </>
  );
}

export function HeaderUserMenu() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const logout = useAuthActions().logout;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleEditProfile = () => {
    navigate("/settings");
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="flex h-8 w-8 items-center justify-center rounded-full p-0"
          title={`${user.first_name} ${user.last_name}`}
        >
          <UserAvatar user={user} className="h-8 w-8" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="bg-muted/30 flex items-center gap-3 rounded-none p-3 text-right">
            <UserInfo user={user} />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-none text-right transition-colors"
            onClick={handleEditProfile}
          >
            <IconUserCircle className="size-4" />
            <span className="flex-1">{navigation.settings}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          className="text-destructive hover:bg-destructive/5 hover:text-destructive flex cursor-pointer items-center gap-3 rounded-none text-right transition-colors"
          onClick={handleLogout}
        >
          <IconLogout className="size-4" />
          <span className="flex-1">{userLabels.dropdown.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
