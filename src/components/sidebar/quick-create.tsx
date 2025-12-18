import { IconCirclePlusFilled } from "@tabler/icons-react";
import { NavLink } from "react-router-dom";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { fa } from "@/constants/text";

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
            tooltip={fa.navigation.quickCreate.tooltip}
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8"
          >
            <IconCirclePlusFilled />
            <span>{fa.navigation.quickCreate.button}</span>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
