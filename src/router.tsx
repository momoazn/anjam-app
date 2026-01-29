import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { ErrorBoundary } from "@/components/error-boundary";
import { RouteSuspense } from "@/components/route-suspense";
import {
  app,
  auth,
  errors,
  inbox,
  insights,
  navigation,
  notFound,
  organization,
  projects,
  savedFilters,
  settings,
  tagsManagement,
  tasks,
  ui,
} from "@/constants";

import { usePermissions } from "./hooks/use-permissions";
import { authClient } from "./lib/auth-client";
import type { Permission } from "./lib/permissions";
import {
  useAuthIsAuthenticated,
  useAuthStore,
  useAuthUser,
  useCurrentOrgOnboardingCompleted,
  useCurrentOrganization,
} from "./store/app-context-store";

// Standardized error fallback component for lazy-loaded routes
const PageLoadError = ({ message }: { message: string }) => (
  <div className="flex min-h-screen items-center justify-center p-4">
    <div className="text-center">
      <p className="text-destructive text-lg font-medium">{message}</p>
      <p className="text-muted-foreground mt-2 text-sm">
        {ui.pageLoadError.refreshMessage}
      </p>
    </div>
  </div>
);

// Lazy load pages with standardized error handling
const createLazyPage = (
  importFn: () => Promise<{ default: React.ComponentType }>,
  errorMessage: string,
) =>
  React.lazy(() =>
    importFn().catch(() => ({
      default: () => <PageLoadError message={errorMessage} />,
    })),
  );

const Login = createLazyPage(
  () => import("@/pages/auth/login"),
  errors.pageLoad.login,
);
const Register = createLazyPage(
  () => import("@/pages/auth/register"),
  errors.pageLoad.register,
);
const Landing = createLazyPage(
  () => import("@/pages/utility/landing"),
  errors.pageLoad.notFound,
);
const PendingActivation = createLazyPage(
  () => import("@/pages/auth/pending-activation"),
  errors.pageLoad.notFound,
);
const Projects = createLazyPage(
  () => import("@/pages/projects/index"),
  errors.pageLoad.projects,
);
const ProjectDetails = createLazyPage(
  () => import("@/pages/projects/details"),
  errors.pageLoad.projects,
);
const TaskBoardPage = createLazyPage(
  () =>
    import("@/pages/tasks/board").then((module) => ({
      default: module.TaskBoardPage,
    })),
  errors.pageLoad.tasks,
);
const Tasks = createLazyPage(
  () => import("@/pages/tasks/index"),
  errors.pageLoad.tasks,
);
const TaskDetails = createLazyPage(
  () => import("@/pages/tasks/details"),
  errors.pageLoad.tasks,
);
const Tags = createLazyPage(
  () => import("@/pages/utility/tags"),
  errors.pageLoad.notFound,
);
const TaskCalendar = createLazyPage(
  () => import("@/pages/tasks/calendar"),
  errors.pageLoad.notFound,
);
const Inbox = createLazyPage(
  () => import("@/pages/insights/inbox"),
  errors.pageLoad.notFound,
);
const ProjectTasks = createLazyPage(
  () => import("@/pages/projects/tasks"),
  errors.pageLoad.projectTasks,
);
const Insights = createLazyPage(
  () => import("@/pages/insights/insights"),
  errors.pageLoad.notFound,
);
const Helps = createLazyPage(
  () => import("@/pages/utility/helps"),
  errors.pageLoad.helps,
);
const Settings = createLazyPage(
  () => import("@/pages/settings/index"),
  errors.pageLoad.notFound,
);
const PreferencesPage = createLazyPage(
  () => import("@/pages/settings/preferences"),
  errors.pageLoad.notFound,
);
const Notifications = createLazyPage(
  () => import("@/pages/insights/notifications"),
  errors.pageLoad.notifications,
);
const Views = createLazyPage(
  () => import("@/pages/insights/views"),
  errors.pageLoad.notFound,
);
const NotFound = createLazyPage(
  () => import("@/pages/utility/not-found"),
  errors.pageLoad.notFound,
);

// Organization pages (lazy loaded)
const SelectOrganization = createLazyPage(
  () =>
    import("@/pages/organizations/select").then((module) => ({
      default: module.SelectOrganizationPage,
    })),
  errors.pageLoad.notFound,
);
const OrgSettings = createLazyPage(
  () =>
    import("@/pages/settings/organization").then((module) => ({
      default: module.OrgSettingsPage,
    })),
  errors.pageLoad.notFound,
);
const OrgMembers = createLazyPage(
  () =>
    import("@/pages/settings/members").then((module) => ({
      default: module.OrgMembersPage,
    })),
  errors.pageLoad.notFound,
);
const InviteAccept = createLazyPage(
  () =>
    import("@/pages/auth/invite-accept").then((module) => ({
      default: module.InviteAccept,
    })),
  errors.pageLoad.notFound,
);
const Onboarding = createLazyPage(
  () => import("@/pages/auth/onboarding"),
  errors.pageLoad.notFound,
);

// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isPending: isAuthLoading } = authClient.useSession();
  const isLoggedIn = useAuthIsAuthenticated();
  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// RequireOrganization component - ensures user has an organization selected
const RequireOrganization = ({ children }: { children: React.ReactNode }) => {
  const { isPending: isAuthLoading } = authClient.useSession();
  const isLoggedIn = useAuthIsAuthenticated();
  const currentOrg = useCurrentOrganization();
  const userOrganizations = useAuthStore((s) => s.userOrganizations);
  const isLoadingOrgs = useAuthStore((s) => s.isLoadingOrgs);
  const onboardingCompleted = useCurrentOrgOnboardingCompleted();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Don't redirect while loading organizations
  if (isLoadingOrgs) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  // If user has no organizations at all, redirect to onboarding to create one
  if (!currentOrg && userOrganizations.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to organization selection if no organization is selected but user has organizations
  if (!currentOrg && userOrganizations.length > 0) {
    return <Navigate to="/select-organization" replace />;
  }

  // Redirect to onboarding if not completed for current organization
  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// PermissionProtectedRoute component for role-based access
const PermissionProtectedRoute = ({
  children,
  permission,
}: {
  children: React.ReactNode;
  permission: Permission;
}) => {
  const { isPending: isAuthLoading } = authClient.useSession();
  const user = useAuthUser();
  const { can } = usePermissions();
  const isLoggedIn = useAuthIsAuthenticated();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Special case: allow users to edit their own profile
  if (
    permission === "org.manage_members" &&
    window.location.pathname.match(/^\/settings\/members\/[^/]+$/)
  ) {
    const urlParts = window.location.pathname.split("/");
    const userIdInUrl = urlParts[4];
    if (user?._id === userIdInUrl) {
      return <>{children}</>;
    }
  }

  if (!can(permission)) {
    return <Navigate to="/inbox" replace />;
  }

  return <>{children}</>;
};

// PublicRoute component (redirects authenticated users to inbox)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isPending: isAuthLoading } = authClient.useSession();
  const isLoggedIn = useAuthIsAuthenticated();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }
  if (isLoggedIn) {
    return <Navigate to="/inbox" replace />;
  }
  return <>{children}</>;
};

// LandingRoute component (redirects authenticated users to inbox, shows landing for guests)
const LandingRoute = ({ children }: { children: React.ReactNode }) => {
  const { isPending: isAuthLoading } = authClient.useSession();
  const isLoggedIn = useAuthIsAuthenticated();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }
  if (isLoggedIn) {
    return <Navigate to="/inbox" replace />;
  }
  return <>{children}</>;
};

type RouteType = {
  path: string;
  element: React.ReactNode;
  protected: boolean;
  permission?: string;
  title?: string;
  requiresOrg?: boolean;
};

const Title = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if (title) document.title = `${title} • ${app.name}`;
    else document.title = app.name;
  }, [title]);

  return (
    <div key={title} data-page-transition>
      {children}
    </div>
  );
};

// Routes configuration for product mode (Linear-inspired)
const routes: RouteType[] = [
  {
    path: "/",
    element: (
      <LandingRoute>
        <Landing />
      </LandingRoute>
    ),
    protected: false,
    title: navigation.dashboard,
  },
  // Organization routes
  {
    path: "/select-organization",
    element: <SelectOrganization />,
    protected: true,
    requiresOrg: false,
    title: organization.title,
  },
  {
    path: "/settings/organization",
    element: (
      <PermissionProtectedRoute permission="org.update">
        <OrgSettings />
      </PermissionProtectedRoute>
    ),
    protected: true,
    requiresOrg: true,
    title: organization.settings.title,
  },
  {
    path: "/settings/members",
    element: (
      <PermissionProtectedRoute permission="org.manage_members">
        <OrgMembers />
      </PermissionProtectedRoute>
    ),
    protected: true,
    requiresOrg: true,
    title: organization.members.title,
  },
  // Product mode routes
  {
    path: "/inbox",
    element: <Inbox />,
    protected: true,
    requiresOrg: true,
    title: inbox.title,
  },
  {
    path: "/members",
    element: (
      <PermissionProtectedRoute permission="org.manage_members">
        <OrgMembers />
      </PermissionProtectedRoute>
    ),
    protected: true,
    requiresOrg: true,
    title: organization.members.title,
  },
  {
    path: "/issues",
    element: <Inbox />,
    protected: true,
    requiresOrg: true,
    title: tasks.title,
  },
  {
    path: "/insights",
    element: <Insights />,
    protected: true,
    requiresOrg: true,
    title: insights.title,
  },
  // Views page and saved-filters alias
  {
    path: "/views",
    element: <Views />,
    protected: true,
    requiresOrg: true,
    title: savedFilters.views.title,
  },
  {
    path: "/saved-filters",
    element: <Views />,
    protected: true,
    requiresOrg: true,
    title: savedFilters.title,
  },
  {
    path: "/projects",
    element: <Projects />,
    protected: true,
    requiresOrg: true,
    title: navigation.projects,
  },
  {
    path: "/projects/:id/details",
    element: <ProjectDetails />,
    protected: true,
    requiresOrg: true,
    title: projects.details.title,
  },
  {
    path: "/login",
    element: <Login />,
    protected: false,
    title: auth.login.title,
  },
  {
    path: "/register",
    element: <Register />,
    protected: false,
    title: auth.register.title,
  },
  {
    path: "/pending-activation",
    element: <PendingActivation />,
    protected: false,
    title: auth.pendingActivation.title,
  },
  {
    path: "/invite/:token",
    element: <InviteAccept />,
    protected: false,
    title: auth.invite.title,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
    protected: true,
    requiresOrg: false,
    title: auth.onboarding.title,
  },
  {
    path: "/tasks",
    element: <Tasks />,
    protected: true,
    requiresOrg: true,
    title: tasks.title,
  },
  {
    path: "/tasks/board",
    element: (
      <PermissionProtectedRoute permission="task.view">
        <TaskBoardPage />
      </PermissionProtectedRoute>
    ),
    protected: true,
    requiresOrg: true,
    title: tasks.board.title,
  },
  {
    path: "/tasks/:id",
    element: <TaskDetails />,
    protected: true,
    requiresOrg: true,
    title: tasks.details.title,
  },
  {
    path: "/tags",
    element: <Tags />,
    protected: true,
    requiresOrg: true,
    title: tagsManagement.title,
  },
  {
    path: "/tasks/calendar",
    element: <TaskCalendar />,
    protected: true,
    requiresOrg: true,
    title: tasks.calendar.title,
  },
  {
    path: "/projects/:id/tasks",
    element: <ProjectTasks />,
    protected: true,
    requiresOrg: true,
    title: projects.projectTasks,
  },
  {
    path: "/projects/:id/board",
    element: (
      <PermissionProtectedRoute permission="task.view">
        <TaskBoardPage />
      </PermissionProtectedRoute>
    ),
    protected: true,
    requiresOrg: true,
    title: tasks.board.title,
  },
  {
    path: "/helps",
    element: <Helps />,
    protected: true,
    requiresOrg: true,
    title: navigation.helps,
  },
  {
    path: "/settings",
    element: <Settings />,
    protected: true,
    requiresOrg: true,
    title: navigation.settings,
  },
  {
    path: "/settings/preferences",
    element: <PreferencesPage />,
    protected: true,
    requiresOrg: false,
    title: settings.preferences.title,
  },
  {
    path: "/notifications",
    element: <Notifications />,
    protected: true,
    requiresOrg: true,
    title: navigation.notifications,
  },
  {
    path: "*",
    element: <NotFound />,
    protected: false,
    title: notFound.title,
  },
];

// AppRoutes component
export const AppRoutes = () => {
  return (
    <ErrorBoundary onError={() => window.location.reload()}>
      <Routes>
        {routes.map((route) => {
          const routeKey = route.path.startsWith("/projects")
            ? "projects"
            : route.path.startsWith("/tasks")
              ? "tasks"
              : route.path.startsWith("/notifications")
                ? "notifications"
                : undefined;

          const content = (
            <RouteSuspense routeKey={routeKey}>
              <Title title={route.title}>{route.element}</Title>
            </RouteSuspense>
          );
          let element = content;

          if (route.protected) {
            if (route.permission) {
              element = (
                <PermissionProtectedRoute
                  permission={route.permission as Permission}
                >
                  {content}
                </PermissionProtectedRoute>
              );
            } else {
              element = <ProtectedRoute>{content}</ProtectedRoute>;
            }

            // Wrap with RequireOrganization if route requires an org
            if (route.requiresOrg) {
              element = <RequireOrganization>{element}</RequireOrganization>;
            }
          } else if (
            route.path === "/login" ||
            route.path === "/register" ||
            route.path === "/pending-activation" ||
            route.path === "/invite/:token"
          ) {
            element = <PublicRoute>{content}</PublicRoute>;
          }

          return <Route key={route.path} path={route.path} element={element} />;
        })}
      </Routes>
    </ErrorBoundary>
  );
};
