import { digitsEnToFa } from "@persian-tools/persian-tools";
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
import { cn } from "@/lib/utils";
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
        title: navigation.reportIssue,
        url: `${app.repoUrl}/issues/new`,
        icon: IconMessage,
        external: true,
      },
    ],
  };
}

function AppSidebarHeader() {
  const { isMobile, setOpenMobile, state } = useSidebar();

  return (
    <SidebarHeader className="border-border/40 h-16 border-b p-2">
      <SidebarMenu className="h-full">
        <SidebarMenuItem className="h-full">
          <SidebarMenuButton
            asChild
            className="hover:bg-accent active:bg-accent/80 h-full rounded-xl transition-all duration-200"
          >
            <NavLink
              to="/inbox"
              className="flex h-full w-full items-center gap-3 px-3"
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
            >
              <div className="relative">
                <Logo
                  size={40}
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

function SidebarFooterLinks({ items }: { items: NavItem[] }) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const linkClass =
    "text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors";

  return (
    <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
      {items.map((item) => {
        const Icon = item.icon;
        const content = (
          <>
            {Icon && <Icon className="size-4 shrink-0" />}
            {!collapsed && <span>{item.title}</span>}
          </>
        );
        return item.external ? (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            title={item.title}
            className={linkClass}
          >
            {content}
          </a>
        ) : (
          <NavLink
            key={item.url}
            to={item.url}
            title={item.title}
            className={linkClass}
            onClick={() => isMobile && setOpenMobile(false)}
          >
            {content}
          </NavLink>
        );
      })}
      {!collapsed && (
        <span className="text-muted-foreground/60 ms-auto px-2 text-[11px] tabular-nums">
          {navigation.version} {digitsEnToFa(__APP_VERSION__)}
        </span>
      )}
    </div>
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
        <div className="border-border/40 border-b bg-muted/20 py-1">
          <OrgSwitcher />
        </div>

        {/* Quick Create */}
        <div className="border-border/40 border-b p-2">
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

      <SidebarFooter className="border-border/40 relative z-10 border-t p-2">
        <SidebarFooterLinks items={navItems.navSecondary} />
      </SidebarFooter>
    </Sidebar>
  );
}
