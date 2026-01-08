import {
  IconBell,
  IconHelp,
  IconInbox,
  IconMessage,
  IconRocket,
  IconSettings,
  IconTag,
  IconUsers,
} from "@tabler/icons-react";
import { NavLink } from "react-router-dom";

import { Logo } from "@/components/logo";
import { NavMain } from "@/components/nav-main";
import { OrgSwitcher } from "@/components/organization/org-switcher";
import { ProjectsSubmenu } from "@/components/sidebar/projects-submenu";
import { QuickCreate } from "@/components/sidebar/quick-create";
import { TaskViews } from "@/components/sidebar/task-views";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { app, inbox, navigation } from "@/constants";
import { usePermissions } from "@/hooks/use-permissions";
import type { Permission } from "@/lib/permissions";
import { isOrgAdmin } from "@/lib/permissions";
import { useAuthUser, useCurrentOrgRole } from "@/store/app-context-store";

type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  external?: boolean;
};

interface NavItemSet {
  navWorkspace: NavItem[];
  navManagement: NavItem[];
  navAdmin: NavItem[];
  navSecondary: NavItem[];
}

/**
 * Product mode navigation items (Linear-inspired)
 */
function getNavItems(
  can: (permission: Permission) => boolean,
  showAdminItems: boolean,
): NavItemSet {
  return {
    navWorkspace: [
      {
        title: inbox.title,
        url: "/inbox",
        icon: IconInbox,
      },
      {
        title: navigation.notifications,
        url: "/notifications",
        icon: IconBell,
      },
    ],
    navManagement: [
      {
        title: navigation.insights,
        url: "/insights",
        icon: IconRocket,
        permission: "org.view" as Permission,
      },
      {
        title: navigation.tags,
        url: "/tags",
        icon: IconTag,
        permission: "project.view" as Permission,
      },
    ].filter((item) => (item.permission ? can(item.permission) : true)),
    navAdmin: showAdminItems
      ? [
          {
            title: navigation.members,
            url: "/settings/members",
            icon: IconUsers,
          },
          {
            title: navigation.settings,
            url: "/settings/organization",
            icon: IconSettings,
          },
        ]
      : [],
    navSecondary: [
      {
        title: navigation.helps,
        url: "/helps",
        icon: IconHelp,
      },
      {
        title: navigation.alphaFeedback,
        url: "https://github.com/mohammadhmn/anjam/issues/new?labels=alpha-feedback",
        icon: IconMessage,
        external: true,
      },
    ],
  };
}

function AppSidebarHeader() {
  const { isMobile, setOpenMobile, state } = useSidebar();

  return (
    <SidebarHeader className="border-border/40 h-20 border-b p-2">
      <SidebarMenu className="h-full">
        <SidebarMenuItem className="h-full">
          <SidebarMenuButton
            asChild
            className="hover:bg-accent active:bg-accent/80 h-full rounded-xl transition-all duration-200"
          >
            <NavLink
              to="/inbox"
              className="flex h-full w-full items-center gap-4 px-4"
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
            >
              <div className="relative">
                <Logo
                  size={60}
                  className="shrink-0 transition-transform duration-300"
                />
              </div>
              {state === "expanded" && (
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-xl font-bold tracking-tight">
                    {app.name}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium opacity-80">
                    {app.description}
                  </span>
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

  const navItems = getNavItems(can, showAdminItems);

  return (
    <Sidebar collapsible="icon" className="border-border/40" {...props}>
      <AppSidebarHeader />

      <SidebarContent className="scrollbar-thin relative z-10 flex flex-col flex-1 overflow-y-auto p-0">
        {/* Organization Switcher */}
        <div className="border-border/40 border-b bg-muted/20 py-2">
          <OrgSwitcher />
        </div>

        {/* Quick Create */}
        <div className="border-border/40 border-b p-3">
          <QuickCreate />
        </div>

        {/* Workspace Section */}
        <NavMain
          items={navItems.navWorkspace}
          title={navigation.workspaceSection}
        />

        {/* Projects Section */}
        <div className="border-border/40 border-b">
          <ProjectsSubmenu />
        </div>

        {/* Task Views Section */}
        <TaskViews labels={{ savedFilters: "نماها" }} />

        {/* Management Section */}
        {navItems.navManagement.length > 0 && (
          <NavMain
            items={navItems.navManagement}
            title={navigation.managementSection}
          />
        )}

        {/* Admin Section */}
        {navItems.navAdmin.length > 0 && (
          <NavMain
            items={navItems.navAdmin}
            title={navigation.organizationSection}
          />
        )}
      </SidebarContent>

      <SidebarFooter className="border-border/40 relative z-10 flex flex-col border-t p-0">
        <NavMain items={navItems.navSecondary} title={navigation.helpSection} />
        <div className="bg-muted/40 flex items-center justify-between border-t px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground/60 font-mono text-[10px] font-bold uppercase tracking-widest">
              {navigation.version}
            </span>
            <span className="text-muted-foreground/40 text-[9px] font-mono">
              v0.8.2-alpha
            </span>
          </div>
          <span className="rounded bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {navigation.alpha}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
