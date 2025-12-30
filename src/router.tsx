import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { PageErrorBoundary } from "@/components/error/page-error-boundary";
import { RouteSuspense } from "@/components/suspense/route-suspense";
import {
  app,
  auth,
  errors,
  myTasks,
  navigation,
  navigationLabels,
  notFound,
  organization,
  projects,
  settings,
  tagsManagement,
  tasks,
  ui,
  users,
} from "@/constants";
import type { Permission } from "./lib/permissions";
import { usePermissions } from "./hooks/usePermissions";
import {
  useAuthIsLoggedIn,
  useAuthUser,
  useCurrentOrganization,
  useCurrentOrgOnboardingCompleted,
  useCurrentOrgMode,
  useCurrentOrgFeatures,
  useAuthStore,
} from "./store/auth-store";
import type { FeatureKey } from "./lib/mode-features";
import { isFeatureEnabled, getHomeRoute } from "./lib/mode-features";

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
  () => import("@/pages/login"),
  errors.pageLoad.login,
);
const Register = createLazyPage(
  () => import("@/pages/register"),
  errors.pageLoad.register,
);
const Landing = createLazyPage(
  () => import("@/pages/landing"),
  errors.pageLoad.notFound,
);
const PendingActivation = createLazyPage(
  () => import("@/pages/pending-activation"),
  errors.pageLoad.notFound,
);
const Dashboard = createLazyPage(
  () => import("@/pages/dashboard"),
  errors.pageLoad.dashboard,
);
const Projects = createLazyPage(
  () => import("@/pages/projects"),
  errors.pageLoad.projects,
);
const ProjectDetails = createLazyPage(
  () => import("@/pages/project-details"),
  errors.pageLoad.projects,
);
const CreateProject = createLazyPage(
  () => import("@/pages/create-project"),
  errors.pageLoad.projects,
);
const EditProject = createLazyPage(
  () => import("@/pages/edit-project"),
  errors.pageLoad.projects,
);
const TaskBoardPage = createLazyPage(
  () =>
    import("@/pages/task-board").then((module) => ({
      default: module.TaskBoardPage,
    })),
  errors.pageLoad.tasks,
);
const Tasks = createLazyPage(
  () => import("@/pages/tasks"),
  errors.pageLoad.tasks,
);
const CreateTask = createLazyPage(
  () => import("@/pages/create-task"),
  errors.pageLoad.tasks,
);
const TaskDetails = createLazyPage(
  () => import("@/pages/task-details"),
  errors.pageLoad.tasks,
);
const EditTask = createLazyPage(
  () => import("@/pages/edit-task"),
  errors.pageLoad.tasks,
);
const Tags = createLazyPage(
  () => import("@/pages/tags"),
  errors.pageLoad.notFound,
);
const TaskCalendar = createLazyPage(
  () => import("@/pages/task-calendar"),
  errors.pageLoad.notFound,
);
const MyTasks = createLazyPage(
  () => import("@/pages/my-tasks"),
  errors.pageLoad.notFound,
);
const Timesheet = createLazyPage(
  () => import("@/pages/timesheet"),
  errors.pageLoad.notFound,
);
const ProjectTasks = createLazyPage(
  () => import("@/pages/project-tasks"),
  errors.pageLoad.projectTasks,
);
const Users = createLazyPage(
  () => import("@/pages/users"),
  errors.pageLoad.users,
);
const CreateUser = createLazyPage(
  () => import("@/pages/create-user"),
  errors.pageLoad.users,
);
const ProjectUsers = createLazyPage(
  () => import("@/pages/project-users"),
  errors.pageLoad.projectUsers,
);
const EditUser = createLazyPage(
  () => import("@/pages/edit-user"),
  errors.pageLoad.users,
);
const Reports = createLazyPage(
  () => import("@/pages/reports"),
  errors.pageLoad.reports,
);
const Helps = createLazyPage(
  () => import("@/pages/helps"),
  errors.pageLoad.helps,
);
const Settings = createLazyPage(
  () => import("@/pages/settings"),
  errors.pageLoad.notFound,
);
const PreferencesPage = createLazyPage(
  () => import("@/pages/settings/preferences"),
  errors.pageLoad.notFound,
);
const Notifications = createLazyPage(
  () => import("@/pages/notifications"),
  errors.pageLoad.notifications,
);
const AuditLogs = createLazyPage(
  () => import("@/pages/audit-logs"),
  errors.pageLoad.notFound,
);
const Insights = createLazyPage(
  () => import("@/pages/insights"),
  errors.pageLoad.notFound,
);
const Views = createLazyPage(
  () => import("@/pages/views"),
  errors.pageLoad.notFound,
);
const NotFound = createLazyPage(
  () => import("@/pages/not-found"),
  errors.pageLoad.notFound,
);

// Organization pages (lazy loaded)
const SelectOrganization = createLazyPage(
  () =>
    import("@/pages/select-organization").then((module) => ({
      default: module.SelectOrganizationPage,
    })),
  errors.pageLoad.notFound,
);
const CreateOrganization = createLazyPage(
  () =>
    import("@/pages/organizations/create").then((module) => ({
      default: module.CreateOrganizationPage,
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
    import("@/pages/invite-accept").then((module) => ({
      default: module.InviteAccept,
    })),
  errors.pageLoad.notFound,
);
const Onboarding = createLazyPage(
  () => import("@/pages/onboarding"),
  errors.pageLoad.notFound,
);

// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthIsLoggedIn();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// RequireOrganization component - ensures user has an organization selected
const RequireOrganization = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthIsLoggedIn();
  const currentOrg = useCurrentOrganization();
  const isLoadingOrgs = useAuthStore((s) => s.isLoadingOrgs);
  const onboardingCompleted = useCurrentOrgOnboardingCompleted();

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

  // Redirect to organization selection if no organization is selected
  if (!currentOrg) {
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
  const user = useAuthUser();
  const { can } = usePermissions();
  const isLoggedIn = useAuthIsLoggedIn();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Special case: allow users to edit their own profile
  if (
    permission === "org.manage_members" &&
    window.location.pathname.match(/^\/users\/[^/]+\/edit$/)
  ) {
    const urlParts = window.location.pathname.split("/");
    const userIdInUrl = urlParts[2];
    if (user?.id === userIdInUrl) {
      // User is editing their own profile, allow access
      return <>{children}</>;
    }
  }

  if (!can(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * FeatureProtectedRoute - Route guard that blocks access to features disabled in current org mode
 *
 * Usage:
 *   <FeatureProtectedRoute feature="timesheet">
 *     <Timesheet />
 *   </FeatureProtectedRoute>
 *
 * If feature is disabled, redirects to home route for the current mode.
 */
const FeatureProtectedRoute = ({
  children,
  feature,
  redirectTo,
}: {
  children: React.ReactNode;
  feature: FeatureKey;
  redirectTo?: string;
}) => {
  const features = useCurrentOrgFeatures();
  const mode = useCurrentOrgMode();
  const isLoggedIn = useAuthIsLoggedIn();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isFeatureEnabled(features, feature)) {
    // Redirect to mode-appropriate home (product: /inbox, operations: /dashboard)
    const fallback = redirectTo ?? getHomeRoute(mode);
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

// PublicRoute component (redirects authenticated users to appropriate home)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthIsLoggedIn();
  const mode = useCurrentOrgMode();

  if (isLoggedIn) {
    return <Navigate to={getHomeRoute(mode)} replace />;
  }
  return <>{children}</>;
};

type RouteType = {
  path: string;
  element: React.ReactNode;
  protected: boolean;
  permission?: string;
  feature?: FeatureKey; // NEW: for feature-gated routes
  title?: string;
  requiresOrg?: boolean; // If true, requires organization to be selected
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
  return <>{children}</>;
};

// Memoized routes configuration
const routes: RouteType[] = [
  {
    path: "/",
    element: <Landing />,
    protected: false,
    title: "داشبورد",
  },
  // Organization routes (public - no RequireOrganization needed)
  {
    path: "/select-organization",
    element: <SelectOrganization />,
    protected: true,
    requiresOrg: false,
    title: "Select Organization",
  },
  {
    path: "/organizations/new",
    element: <CreateOrganization />,
    protected: true,
    requiresOrg: false,
    title: organization.create.title,
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
  {
    path: "/dashboard",
    element: <Dashboard />,
    protected: true,
    requiresOrg: true,
    title: navigation.dashboard,
  },
  // Product mode route aliases
  {
    path: "/inbox",
    element: <MyTasks />,
    protected: true,
    requiresOrg: true,
    title: "Inbox",
  },
  {
    path: "/issues",
    element: <Tasks />,
    protected: true,
    requiresOrg: true,
    title: "Issues",
  },
  {
    path: "/insights",
    element: <Insights />,
    protected: true,
    requiresOrg: true,
    title: "Insights",
  },
  // Views page and saved-filters alias
  {
    path: "/views",
    element: <Views />,
    protected: true,
    requiresOrg: true,
    title: "Views",
  },
  {
    path: "/saved-filters",
    element: <Views />,
    protected: true,
    requiresOrg: true,
    title: "Saved Filters",
  },
  {
    path: "/projects",
    element: <Projects />,
    protected: true,
    requiresOrg: true,
    title: navigation.projects,
  },
  {
    path: "/projects/new",
    element: <CreateProject />,
    protected: true,
    requiresOrg: true,
    title: projects.create.title,
  },
  {
    path: "/projects/:id/details",
    element: <ProjectDetails />,
    protected: true,
    requiresOrg: true,
    title: projects.details.title,
  },
  {
    path: "/projects/:id/edit",
    element: <EditProject />,
    protected: true,
    requiresOrg: true,
    title: projects.edit.title,
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
    title: users.pendingActivation.title,
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
    title: tasks.board.title, // Assuming a title for task board
  },
  {
    path: "/tasks/new",
    element: <CreateTask />,
    protected: true,
    requiresOrg: true,
    title: tasks.addTask.title,
  },
  {
    path: "/tasks/:id",
    element: <TaskDetails />,
    protected: true,
    requiresOrg: true,
    title: tasks.details.title,
  },
  {
    path: "/tasks/:id/edit",
    element: <EditTask />,
    protected: true,
    requiresOrg: true,
    title: tasks.edit.title,
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
    path: "/my-tasks",
    element: <MyTasks />,
    protected: true,
    requiresOrg: true,
    title: myTasks.title,
  },
  {
    path: "/timesheet",
    element: (
      <FeatureProtectedRoute feature="timesheet">
        <Timesheet />
      </FeatureProtectedRoute>
    ),
    protected: true,
    requiresOrg: true,
    feature: "timesheet",
    title: navigationLabels.timesheet,
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
    path: "/projects/:id/tasks/new",
    element: <CreateTask />,
    protected: true,
    requiresOrg: true,
    title: tasks.addTask.title,
  },
  {
    path: "/tasks/new",
    element: <CreateTask />,
    protected: true,
    requiresOrg: true,
    title: tasks.addTask.title,
  },
  {
    path: "/users",
    element: <Users />,
    protected: true,
    requiresOrg: true,
    permission: "org.manage_members",
    title: users.title,
  },
  {
    path: "/users/new",
    element: <CreateUser />,
    protected: true,
    requiresOrg: true,
    permission: "org.manage_members",
    title: users.create.title,
  },
  {
    path: "/users/:id/edit",
    element: <EditUser />,
    protected: true,
    requiresOrg: true,
    permission: "org.manage_members",
    title: users.edit.title,
  },
  {
    path: "/projects/:id/users",
    element: <ProjectUsers />,
    protected: true,
    requiresOrg: true,
    title: projects.users.title,
  },
  {
    path: "/reports",
    element: (
      <FeatureProtectedRoute feature="reports">
        <Reports />
      </FeatureProtectedRoute>
    ),
    protected: true,
    requiresOrg: true,
    feature: "reports",
    title: navigation.reports,
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
    path: "/audit-logs",
    element: (
      <PermissionProtectedRoute permission="org.manage_members">
        <FeatureProtectedRoute feature="auditLogs">
          <AuditLogs />
        </FeatureProtectedRoute>
      </PermissionProtectedRoute>
    ),
    protected: true,
    requiresOrg: true,
    feature: "auditLogs",
    title: navigation.auditLogs,
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
    <PageErrorBoundary onRetry={() => window.location.reload()}>
      <Routes>
        {routes.map((route) => {
          const routeKey =
            route.path === "/dashboard"
              ? "dashboard"
              : route.path.startsWith("/projects")
                ? "projects"
                : route.path.startsWith("/tasks")
                  ? "tasks"
                  : route.path.startsWith("/users")
                    ? "users"
                    : route.path.startsWith("/reports")
                      ? "reports"
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
    </PageErrorBoundary>
  );
};
