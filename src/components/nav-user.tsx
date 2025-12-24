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

import {
  navigation,
  user as userLabels,
  users as usersText,
} from "@/constants";
import type { UsersRecord } from "@/lib/pocketbase-types";
import { useAuthActions, useAuthUser } from "@/store/auth-store";
import { UserAvatar } from "./user-avatar";
import { cn } from "@/lib/utils";

type UserInfoProps = {
  user: UsersRecord;
};

function UserInfo({ user }: UserInfoProps) {
  return (
    <>
      <div className="relative">
        <UserAvatar
          user={user}
          className="border-border/40 size-8 rounded-none border"
        />
        <div className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-none bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden text-right">
        <div className="flex items-center justify-end gap-2">
          <span className="text-foreground truncate text-[11px] font-black tracking-tight uppercase">
            {user.first_name} {user.last_name}
          </span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-muted-foreground/40 truncate font-mono text-[8px] leading-none tracking-widest uppercase">
            {
              usersText.table.roles[
                user.role as keyof typeof usersText.table.roles
              ]
            }
          </span>
        </div>
      </div>
    </>
  );
}

export function NavUser() {
  const { isMobile, state } = useSidebar();
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
              className={cn(
                "group border-border/20 bg-muted/5 hover:bg-muted/20 relative overflow-hidden rounded-none border p-2 transition-all active:scale-95",
                state === "collapsed" && "mx-auto h-10 w-10 justify-center p-0",
              )}
            >
              <UserInfo user={user} />
              {state === "expanded" && (
                <IconDotsVertical className="ml-auto size-3 opacity-30 transition-opacity group-hover:opacity-100" />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="border-foreground bg-card w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-none border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={12}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="bg-muted/20 flex items-center gap-3 p-4 text-right">
                <UserInfo user={user} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40 h-px" />
            <DropdownMenuGroup className="p-1">
              <DropdownMenuItem
                className="hover:bg-primary/10 hover:text-primary flex cursor-pointer items-center gap-3 rounded-none p-3 text-right text-[9px] font-black tracking-widest uppercase transition-colors"
                onClick={handleEditProfile}
              >
                <IconUserCircle className="size-4 opacity-40" />
                <span className="flex-1">{navigation.settings}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border/40 h-px" />
            <div className="p-1">
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-3 rounded-none p-3 text-right text-[9px] font-black tracking-widest text-rose-500/80 uppercase transition-colors hover:bg-rose-500/10"
                onClick={handleLogout}
              >
                <IconLogout className="size-4 opacity-40" />
                <span className="flex-1">{userLabels.dropdown.logout}</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
