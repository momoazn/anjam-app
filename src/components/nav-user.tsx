import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
import { useState } from "react";
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

import { EditUserDialog } from "@/components/user/edit-user-dialog";
import { fa } from "@/constants/text";
import { UsersRecord, UsersResponse } from "@/lib/pocketbase-types";
import { useAuthActions, useAuthUser } from "@/store/auth-store";
import { UserAvatar } from "./user-avatar";

type UserInfoProps = {
  user: UsersRecord;
};

function UserInfo({ user }: UserInfoProps) {
  return (
    <>
      <UserAvatar user={user} />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">
          {user.first_name} {user.last_name}
        </span>
        <span className="text-muted-foreground truncate text-xs">
          {user.username}
        </span>
        <span className="text-muted-foreground truncate text-xs">
          {fa.users.table.roles[user.role as keyof typeof fa.users.table.roles]}
        </span>
      </div>
    </>
  );
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const user = useAuthUser();
  const logout = useAuthActions().logout;
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <UserInfo user={user} />
                <IconDotsVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UserInfo user={user} />
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setIsEditOpen(true)}
                >
                  <IconUserCircle />
                  {fa.user.dropdown.account}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleLogout}
              >
                <IconLogout />
                {fa.user.dropdown.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <EditUserDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={user as UsersResponse}
      />
    </>
  );
}
