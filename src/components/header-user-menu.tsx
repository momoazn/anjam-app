import { IconLogout, IconUserCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
        <UserAvatar user={user} className="size-9 rounded-full" />
        {/* Online status indicator */}
        <div className="border-background absolute -end-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 bg-green-500" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <span className="text-foreground truncate text-sm font-bold">
            {user.first_name} {user.last_name}
          </span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-muted-foreground truncate text-[10px] font-bold">
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
          className="hover:bg-muted/50 flex h-9 w-9 items-center justify-center rounded-full p-0 transition-all"
          title={`${user.first_name} ${user.last_name}`}
        >
          <UserAvatar user={user} className="h-9 w-9 rounded-full" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-card w-64 rounded-xl border p-1 shadow-xl"
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 p-3 text-right">
            <UserInfo user={user} />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-1" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-3 rounded-lg p-2.5 text-right text-sm font-bold transition-colors"
            onClick={handleEditProfile}
          >
            <IconUserCircle className="text-muted-foreground size-4" />
            <span className="flex-1">{navigation.settings}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mx-1" />
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-3 rounded-lg p-2.5 text-right text-sm font-bold text-rose-500 transition-colors hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-500"
          onClick={handleLogout}
        >
          <IconLogout className="size-4" />
          <span className="flex-1">{userLabels.dropdown.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
