import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

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
        <div className="border-sidebar absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 bg-green-500" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <span className="text-sidebar-foreground truncate text-sm leading-tight font-semibold">
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

export function NavUser() {
  const { isMobile } = useSidebar();
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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group border-sidebar-border/20 bg-sidebar/50 hover:bg-sidebar/80 data-[state=open]:bg-sidebar data-[state=open]:text-sidebar-foreground relative overflow-hidden rounded-xl border p-3 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-md data-[state=open]:shadow-lg"
            >
              <UserInfo user={user} />
              <IconDotsVertical className="ml-auto size-4 opacity-60 transition-opacity group-hover:opacity-100" />
              {/* Subtle gradient overlay */}
              <div className="to-sidebar/20 absolute inset-0 bg-gradient-to-br from-transparent via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="border-sidebar-border/20 bg-sidebar w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border shadow-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="bg-sidebar/30 flex items-center gap-3 rounded-lg p-3 text-right">
                <UserInfo user={user} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="hover:bg-sidebar/50 flex cursor-pointer items-center gap-3 rounded-lg text-right transition-colors"
                onClick={handleEditProfile}
              >
                <IconUserCircle className="size-4" />
                <span className="flex-1">{navigation.settings}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              className="text-destructive hover:bg-destructive/5 hover:text-destructive flex cursor-pointer items-center gap-3 rounded-lg text-right transition-colors"
              onClick={handleLogout}
            >
              <IconLogout className="size-4" />
              <span className="flex-1">{userLabels.dropdown.logout}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
