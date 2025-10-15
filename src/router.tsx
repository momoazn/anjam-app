import React, { memo, useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { TEXT } from "@/constants/text";
import { useAuthIsLoggedIn } from "./store/auth-store";

// Lazy load pages with better error handling and preloading
const Login = React.lazy(() =>
  import("@/pages/login").catch(() => ({
    default: () => <div>{TEXT.errors.pageLoad.login}</div>,
  })),
);
const Register = React.lazy(() =>
  import("@/pages/register").catch(() => ({
    default: () => <div>{TEXT.errors.pageLoad.register}</div>,
  })),
);
const Dashboard = React.lazy(() =>
  import("@/pages/dashboard").catch(() => ({
    default: () => <div>{TEXT.errors.pageLoad.dashboard}</div>,
  })),
);
const Projects = React.lazy(() =>
  import("@/pages/projects").catch(() => ({
    default: () => <div>{TEXT.errors.pageLoad.projects}</div>,
  })),
);
const Tasks = React.lazy(() =>
  import("@/pages/tasks").catch(() => ({
    default: () => <div>{TEXT.errors.pageLoad.tasks}</div>,
  })),
);
const ProjectTasks = React.lazy(() =>
  import("@/pages/project-tasks").catch(() => ({
    default: () => <div>{TEXT.errors.pageLoad.projectTasks}</div>,
  })),
);
const Users = React.lazy(() =>
  import("@/pages/users").catch(() => ({
    default: () => <div>{TEXT.errors.pageLoad.users}</div>,
  })),
);
const ProjectUsers = React.lazy(() =>
  import("@/pages/project-users").catch(() => ({
    default: () => <div>{TEXT.errors.pageLoad.projectUsers}</div>,
  })),
);
const Reports = React.lazy(() =>
  import("@/pages/reports").catch(() => ({
    default: () => <div>{TEXT.errors.pageLoad.reports}</div>,
  })),
);
const Helps = React.lazy(() =>
  import("@/pages/helps").catch(() => ({
    default: () => <div>{TEXT.errors.pageLoad.helps}</div>,
  })),
);

// Memoized ProtectedRoute component
const ProtectedRoute = memo(({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthIsLoggedIn();

  // const { data: isInitialAdmin } = useIsInitialAdmin();

  // if (!isInitialAdmin) {
  //   return <Navigate to="/register" replace />;
  // }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
});

ProtectedRoute.displayName = "ProtectedRoute";

interface RouteType {
  path: string;
  element: React.ReactNode;
  protected: boolean;
}

// Memoized routes configuration
const routes: RouteType[] = [
  {
    path: "/",
    element: <Dashboard />,
    protected: true,
  },
  {
    path: "/projects",
    element: <Projects />,
    protected: true,
  },
  {
    path: "/login",
    element: <Login />,
    protected: false,
  },
  {
    path: "/register",
    element: <Register />,
    protected: false,
  },
  {
    path: "/tasks",
    element: <Tasks />,
    protected: true,
  },
  {
    path: "/projects/:id/tasks",
    element: <ProjectTasks />,
    protected: true,
  },
  {
    path: "/users",
    element: <Users />,
    protected: true,
  },
  {
    path: "/projects/:id/users",
    element: <ProjectUsers />,
    protected: true,
  },
  {
    path: "/reports",
    element: <Reports />,
    protected: true,
  },
  {
    path: "/helps",
    element: <Helps />,
    protected: true,
  },
];

// Memoized AppRoutes component
export const AppRoutes = memo(() => {
  // Memoize the route elements to prevent unnecessary re-renders
  const routeElements = useMemo(
    () =>
      routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            route.protected ? (
              <ProtectedRoute>{route.element}</ProtectedRoute>
            ) : (
              route.element
            )
          }
        />
      )),
    [],
  );

  return <Routes>{routeElements}</Routes>;
});

AppRoutes.displayName = "AppRoutes";
