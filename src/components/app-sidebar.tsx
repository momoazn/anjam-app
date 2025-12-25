import { NavLink } from "react-router-dom";
import {
  IconDashboard,
  IconInnerShadowTop,
  IconBell,
  IconTag,
  IconChartBar,
  IconClock,
  IconUsers,
  IconHelp,
  IconSettings,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { QuickCreate } from "@/components/sidebar/quick-create";
import { ProjectsSubmenu } from "@/components/sidebar/projects-submenu";
import { TaskViews } from "@/components/sidebar/task-views";
import { NavUser } from "@/components/nav-user";
import { OrgSwitcher } from "@/components/organization/org-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { app, navigation, navigationLabels } from "@/constants";
import type { Permission } from "@/lib/permissions";
import { isOrgAdmin } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuthUser, useCurrentOrgRole } from "@/store/auth-store";
import { Terminal, Cpu } from "lucide-react";

type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  permission?: Permission;
};

const sidebarData = {
  navMain: [
    {
      title: navigation.dashboard,
      url: "/",
      icon: IconDashboard,
    },
    {
      title: navigation.notifications,
      url: "/notifications",
      icon: IconBell,
    },
  ] as NavItem[],
  navAdmin: [
    {
      title: navigation.tags,
      url: "/tags",
      icon: IconTag,
      permission: "project.view",
    },
    {
      title: navigation.reports,
      url: "/reports",
      icon: IconChartBar,
      permission: "org.view",
    },
    {
      title: navigationLabels.timesheet,
      url: "/timesheet",
      icon: IconClock,
      permission: "time_entry.create",
    },
    {
      title: navigation.users,
      url: "/users",
      icon: IconUsers,
      permission: "org.manage_members",
    },
  ] as NavItem[],
  navSecondary: [
    {
      title: navigation.helps,
      url: "/helps",
      icon: IconHelp,
    },
    {
      title: navigation.settings,
      url: "/settings",
      icon: IconSettings,
      permission: "org.update",
    },
  ] as NavItem[],
};

function AppSidebarHeader() {
  const { isMobile, setOpenMobile, state } = useSidebar();

  return (
    <SidebarHeader className="border-border/40 bg-muted/10 h-14 border-b p-0">
      <SidebarMenu className="h-full">
        <SidebarMenuItem className="h-full">
          <SidebarMenuButton
            asChild
            className="hover:bg-muted/30 active:bg-muted/50 h-full rounded-none border-s-0 transition-none"
          >
            <NavLink
              to="/"
              className="flex h-full w-full items-center gap-4 px-6"
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
            >
              <div className="bg-primary text-primary-foreground border-primary/30 flex size-8 items-center justify-center rounded-none border shadow-[-2px_2px_0px_0px_rgba(var(--primary),0.2)]">
                <IconInnerShadowTop className="size-4.5" />
              </div>
              {state === "expanded" && (
                <div className="flex flex-col">
                  <span className="text-xs leading-none font-black tracking-tight uppercase">
                    {app.name}
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 opacity-40">
                    <Terminal className="text-foreground size-2" />
                    <span className="text-[8px] leading-none font-black tracking-[0.2em] uppercase">
                      System_ID :: ANJ-90
                    </span>
                  </div>
                </div>
              )}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthUser();
  const { can } = usePermissions();
  const currentOrgRole = useCurrentOrgRole();
  const showAdminItems = isOrgAdmin(currentOrgRole);

  if (!user) {
    return null;
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-border/40 group-data-[side=left]:border-e group-data-[side=right]:border-s"
      {...props}
    >
      {/* Precision Blueprint Backdrop */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      <AppSidebarHeader />

      <SidebarContent className="scrollbar-none relative z-10 p-0">
        {/* Organization Switcher */}
        <div className="border-border/20 border-b py-3">
          <OrgSwitcher />
        </div>

        {/* Organization Admin Navigation */}
        {showAdminItems && (
          <SidebarGroup className="py-2">
            <SidebarGroupLabel className="text-muted-foreground/30 mb-2 px-4 text-[8px] font-black tracking-[0.3em] uppercase">
              Organization
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                <SidebarMenuItem>
                  <NavLink to="/settings/organization">
                    <SidebarMenuButton tooltip="Organization Settings">
                      <IconSettings className="size-4.5" />
                      <span className="text-[13px] font-black tracking-tight uppercase">
                        Settings
                      </span>
                    </SidebarMenuButton>
                  </NavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <NavLink to="/settings/members">
                    <SidebarMenuButton tooltip="Members">
                      <IconUsers className="size-4.5" />
                      <span className="text-[13px] font-black tracking-tight uppercase">
                        Members
                      </span>
                    </SidebarMenuButton>
                  </NavLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <div className="border-border/20 bg-muted/5 border-b p-4">
          <QuickCreate />
        </div>

        <div className="mt-2">
          <NavMain items={sidebarData.navMain} />
        </div>

        <ProjectsSubmenu />
        <TaskViews />

        <NavMain
          items={sidebarData.navAdmin.filter((item) =>
            item.permission ? can(item.permission) : true,
          )}
          title={navigationLabels.admin}
        />
      </SidebarContent>

      <SidebarFooter className="border-border/40 bg-muted/10 relative z-10 flex flex-col border-t p-0">
        <NavMain
          items={sidebarData.navSecondary.filter((item) =>
            item.permission ? can(item.permission) : true,
          )}
        />

        <div className="border-border/20 border-t p-4 group-data-[state=collapsed]:hidden">
          <div className="mb-4 flex items-center justify-between px-2">
            <div className="flex flex-col">
              <span className="text-muted-foreground/40 mb-1 text-[7px] leading-none font-black tracking-[0.3em] uppercase">
                Kernel_Ver
              </span>
              <span className="text-foreground/60 text-[9px] leading-none font-black tabular-nums">
                node-alpha-central :: 1.04
              </span>
            </div>
            <Cpu className="text-primary/30 size-3" />
          </div>
          <NavUser />
        </div>

        <div className="bg-background flex justify-center py-4 group-data-[state=expanded]:hidden">
          <NavUser />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
