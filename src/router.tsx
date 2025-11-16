import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { fa } from "@/constants/text";
import { can, Permission } from "./lib/permissions";
import { UsersRoleOptions } from "./lib/pocketbase-types";
import { useAuthIsLoggedIn, useAuthUser } from "./store/auth-store";

// Lazy load pages with better error handling and preloading
const Login = React.lazy(() =>
  import("@/pages/login").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.login}</div>,
  })),
);
const Register = React.lazy(() =>
  import("@/pages/register").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.register}</div>,
  })),
);
const PendingActivation = React.lazy(() =>
  import("@/pages/pending-activation").catch(() => ({
    default: () => <div>Error loading page</div>,
  })),
);
const Dashboard = React.lazy(() =>
  import("@/pages/dashboard").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.dashboard}</div>,
  })),
);
const Projects = React.lazy(() =>
  import("@/pages/projects").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.projects}</div>,
  })),
);
const ProjectDetails = React.lazy(() =>
  import("@/pages/project-details").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.projects}</div>,
  })),
);
const CreateProject = React.lazy(() =>
  import("@/pages/create-project").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.projects}</div>,
  })),
);
const EditProject = React.lazy(() =>
  import("@/pages/edit-project").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.projects}</div>,
  })),
);
const Tasks = React.lazy(() =>
  import("@/pages/tasks").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.tasks}</div>,
  })),
);
const CreateTask = React.lazy(() =>
  import("@/pages/create-task").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.tasks}</div>,
  })),
);
const TaskDetails = React.lazy(() =>
  import("@/pages/task-details").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.tasks}</div>,
  })),
);
const EditTask = React.lazy(() =>
  import("@/pages/edit-task").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.tasks}</div>,
  })),
);
const ProjectTasks = React.lazy(() =>
  import("@/pages/project-tasks").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.projectTasks}</div>,
  })),
);
const Users = React.lazy(() =>
  import("@/pages/users").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.users}</div>,
  })),
);
const ProjectUsers = React.lazy(() =>
  import("@/pages/project-users").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.projectUsers}</div>,
  })),
);
const Reports = React.lazy(() =>
  import("@/pages/reports").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.reports}</div>,
  })),
);
const Helps = React.lazy(() =>
  import("@/pages/helps").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.helps}</div>,
  })),
);
const Notifications = React.lazy(() =>
  import("@/pages/notifications").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.notifications}</div>,
  })),
);
const NotFound = React.lazy(() =>
  import("@/pages/not-found").catch(() => ({
    default: () => <div>{fa.errors.pageLoad.notFound}</div>,
  })),
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
    path: "/register",
    element: <Register />,
    protected: false,
    title: fa.auth.register.title,
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
          route.path === "/register" ||
          route.path === "/pending-activation"
        ) {
          element = <PublicRoute>{content}</PublicRoute>;
        }

        return <Route key={route.path} path={route.path} element={element} />;
      })}
    </Routes>
  );
};
