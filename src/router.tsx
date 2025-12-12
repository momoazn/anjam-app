import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { fa } from "@/constants/text";
import { can, Permission } from "./lib/permissions";
import { UsersRoleOptions } from "./lib/pocketbase-types";
import { useAuthIsLoggedIn, useAuthUser } from "./store/auth-store";

// Standardized error fallback component for lazy-loaded routes
const PageLoadError = ({ message }: { message: string }) => (
  <div className="flex min-h-screen items-center justify-center p-4">
    <div className="text-center">
      <p className="text-destructive text-lg font-medium">{message}</p>
      <p className="text-muted-foreground mt-2 text-sm">
        {fa.ui.pageLoadError.refreshMessage}
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
  fa.errors.pageLoad.login,
);
const PendingActivation = createLazyPage(
  () => import("@/pages/pending-activation"),
  fa.errors.pageLoad.notFound,
);
const Dashboard = createLazyPage(
  () => import("@/pages/dashboard"),
  fa.errors.pageLoad.dashboard,
);
const Groups = createLazyPage(
  () => import("@/pages/groups"),
  fa.errors.pageLoad.notFound,
);
const CreateGroup = createLazyPage(
  () => import("@/pages/create-group"),
  fa.errors.pageLoad.notFound,
);
const Projects = createLazyPage(
  () => import("@/pages/projects"),
  fa.errors.pageLoad.projects,
);
const ProjectDetails = createLazyPage(
  () => import("@/pages/project-details"),
  fa.errors.pageLoad.projects,
);
const CreateProject = createLazyPage(
  () => import("@/pages/create-project"),
  fa.errors.pageLoad.projects,
);
const EditProject = createLazyPage(
  () => import("@/pages/edit-project"),
  fa.errors.pageLoad.projects,
);
const Tasks = createLazyPage(
  () => import("@/pages/tasks"),
  fa.errors.pageLoad.tasks,
);
const CreateTask = createLazyPage(
  () => import("@/pages/create-task"),
  fa.errors.pageLoad.tasks,
);
const TaskDetails = createLazyPage(
  () => import("@/pages/task-details"),
  fa.errors.pageLoad.tasks,
);
const EditTask = createLazyPage(
  () => import("@/pages/edit-task"),
  fa.errors.pageLoad.tasks,
);
const Tags = createLazyPage(
  () => import("@/pages/tags"),
  fa.errors.pageLoad.notFound,
);
const TaskCalendar = createLazyPage(
  () => import("@/pages/task-calendar"),
  fa.errors.pageLoad.notFound,
);
const MyTasks = createLazyPage(
  () => import("@/pages/my-tasks"),
  fa.errors.pageLoad.notFound,
);
const Timesheet = createLazyPage(
  () => import("@/pages/timesheet"),
  fa.errors.pageLoad.notFound,
);
const ProjectTasks = createLazyPage(
  () => import("@/pages/project-tasks"),
  fa.errors.pageLoad.projectTasks,
);
const Users = createLazyPage(
  () => import("@/pages/users"),
  fa.errors.pageLoad.users,
);
const CreateUser = createLazyPage(
  () => import("@/pages/create-user"),
  fa.errors.pageLoad.users,
);
const ProjectUsers = createLazyPage(
  () => import("@/pages/project-users"),
  fa.errors.pageLoad.projectUsers,
);
const EditUser = createLazyPage(
  () => import("@/pages/edit-user"),
  fa.errors.pageLoad.users,
);
const Reports = createLazyPage(
  () => import("@/pages/reports"),
  fa.errors.pageLoad.reports,
);
const Helps = createLazyPage(
  () => import("@/pages/helps"),
  fa.errors.pageLoad.helps,
);
const Settings = createLazyPage(
  () => import("@/pages/settings"),
  fa.errors.pageLoad.notFound,
);
const Notifications = createLazyPage(
  () => import("@/pages/notifications"),
  fa.errors.pageLoad.notifications,
);
const NotFound = createLazyPage(
  () => import("@/pages/not-found"),
  fa.errors.pageLoad.notFound,
);

// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthIsLoggedIn();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
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
  const isLoggedIn = useAuthIsLoggedIn();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Special case: allow users to edit their own profile
  if (
    permission === "users.manage" &&
    window.location.pathname.match(/^\/users\/[^/]+\/edit$/)
  ) {
    const urlParts = window.location.pathname.split("/");
    const userIdInUrl = urlParts[2];
    if (user?.id === userIdInUrl) {
      // User is editing their own profile, allow access
      return <>{children}</>;
    }
  }

  if (!can(user?.role as UsersRoleOptions | null, permission)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// PublicRoute component (redirects authenticated users to home)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthIsLoggedIn();
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

type RouteType = {
  path: string;
  element: React.ReactNode;
  protected: boolean;
  permission?: string;
  title?: string;
};

// Sets document.title when mounted
const Title = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if (title) document.title = `${title} • ${fa.app.name}`;
    else document.title = fa.app.name;
  }, [title]);
  return <>{children}</>;
};

// Memoized routes configuration
const routes: RouteType[] = [
  {
    path: "/",
    element: <Dashboard />,
    protected: true,
    title: fa.navigation.dashboard,
  },
  {
    path: "/groups",
    element: <Groups />,
    protected: true,
    permission: "groups.view",
    title: fa.groups.title,
  },
  {
    path: "/groups/new",
    element: <CreateGroup />,
    protected: true,
    permission: "groups.manage",
    title: fa.groups.create.title,
  },
  {
    path: "/projects",
    element: <Projects />,
    protected: true,
    title: fa.navigation.projects,
  },
  {
    path: "/projects/new",
    element: <CreateProject />,
    protected: true,
    title: fa.projects.create.title,
  },
  {
    path: "/projects/:id/details",
    element: <ProjectDetails />,
    protected: true,
    title: fa.projects.details.title,
  },
  {
    path: "/projects/:id/edit",
    element: <EditProject />,
    protected: true,
    title: fa.projects.edit.title,
  },
  {
    path: "/login",
    element: <Login />,
    protected: false,
    title: fa.auth.login.title,
  },
  {
    path: "/pending-activation",
    element: <PendingActivation />,
    protected: false,
    title: fa.users.pendingActivation.title,
  },
  {
    path: "/tasks",
    element: <Tasks />,
    protected: true,
    title: fa.tasks.title,
  },
  {
    path: "/tasks/new",
    element: <CreateTask />,
    protected: true,
    title: fa.tasks.addTask.title,
  },
  {
    path: "/tasks/:id",
    element: <TaskDetails />,
    protected: true,
    title: fa.tasks.details.title,
  },
  {
    path: "/tasks/:id/edit",
    element: <EditTask />,
    protected: true,
    title: fa.tasks.edit.title,
  },
  {
    path: "/tags",
    element: <Tags />,
    protected: true,
    title: fa.tagsManagement.title,
  },
  {
    path: "/tasks/calendar",
    element: <TaskCalendar />,
    protected: true,
    title: fa.tasks.calendar.title,
  },
  {
    path: "/my-tasks",
    element: <MyTasks />,
    protected: true,
    title: fa.myTasks.title,
  },
  {
    path: "/timesheet",
    element: <Timesheet />,
    protected: true,
    title: fa.navigationLabels.timesheet,
  },
  {
    path: "/projects/:id/tasks",
    element: <ProjectTasks />,
    protected: true,
    title: fa.projects.projectTasks,
  },
  {
    path: "/projects/:id/tasks/new",
    element: <CreateTask />,
    protected: true,
    title: fa.tasks.addTask.title,
  },
  {
    path: "/users",
    element: <Users />,
    protected: true,
    permission: "users.view",
    title: fa.users.title,
  },
  {
    path: "/users/new",
    element: <CreateUser />,
    protected: true,
    permission: "users.manage",
    title: fa.users.create.title,
  },
  {
    path: "/users/:id/edit",
    element: <EditUser />,
    protected: true,
    permission: "users.manage",
    title: fa.users.edit.title,
  },
  {
    path: "/projects/:id/users",
    element: <ProjectUsers />,
    protected: true,
    title: fa.projects.users.title,
  },
  {
    path: "/reports",
    element: <Reports />,
    protected: true,
    title: fa.navigation.reports,
  },
  {
    path: "/helps",
    element: <Helps />,
    protected: true,
    title: fa.navigation.helps,
  },
  {
    path: "/settings",
    element: <Settings />,
    protected: true,
    title: fa.navigation.settings,
  },
  {
    path: "/notifications",
    element: <Notifications />,
    protected: true,
    title: fa.navigation.notifications,
  },
  {
    path: "*",
    element: <NotFound />,
    protected: false,
    title: fa.notFound.title,
  },
];

// AppRoutes component
export const AppRoutes = () => {
  return (
    <Routes>
      {routes.map((route) => {
        const content = <Title title={route.title}>{route.element}</Title>;
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
        } else if (
          route.path === "/login" ||
          route.path === "/pending-activation"
        ) {
          element = <PublicRoute>{content}</PublicRoute>;
        }

        return <Route key={route.path} path={route.path} element={element} />;
      })}
    </Routes>
  );
};
