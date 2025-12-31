import { IconCirclePlusFilled } from "@tabler/icons-react";
import { NavLink } from "react-router-dom";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { navigation } from "@/constants";

export function QuickCreate() {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-2">
        <NavLink
          to="/tasks/new"
          className="w-full"
          onClick={() => {
            if (isMobile) {
              setOpenMobile(false);
            }
          }}
        >
          <SidebarMenuButton
            tooltip={navigation.quickCreate.tooltip}
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground h-9 min-w-8 gap-3 px-4"
          >
            <IconCirclePlusFilled className="size-4" />
            <span className="text-sm font-semibold">
              {navigation.quickCreate.button}
            </span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
