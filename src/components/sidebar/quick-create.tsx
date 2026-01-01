import { IconCirclePlusFilled } from "@tabler/icons-react";
import { NavLink } from "react-router-dom";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { navigation } from "@/constants";

export function QuickCreate() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <NavLink to="/tasks/new">
          <SidebarMenuButton className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 min-w-8 gap-3 px-4 w-full">
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
