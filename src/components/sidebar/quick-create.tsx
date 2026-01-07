import { IconCirclePlusFilled } from "@tabler/icons-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { navigation } from "@/constants";
import { useOpenModal } from "@/store/modal-store";

export function QuickCreate() {
  const openModal = useOpenModal();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => openModal("create-task")}
          className="group bg-primary text-primary-foreground hover:bg-primary/90 h-9 min-w-8 gap-3 px-4 w-full transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
        >
          <IconCirclePlusFilled className="size-4 shrink-0 transition-transform duration-200 group-hover:rotate-90" />
          <span className="text-sm font-semibold tracking-tight">
            {navigation.quickCreate.button}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
