import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAuthStore } from "./store/auth-store";

// Lazy load pages
const Login = React.lazy(() => import("@/pages/login"));
const Register = React.lazy(() => import("@/pages/register"));
const Dashboard = React.lazy(() => import("@/pages/dashboard"));
const Projects = React.lazy(() => import("@/pages/projects"));
const Tasks = React.lazy(() => import("@/pages/tasks"));
const ProjectTasks = React.lazy(() => import("@/pages/project-tasks"));
const Users = React.lazy(() => import("@/pages/users"));
const ProjectUsers = React.lazy(() => import("@/pages/project-users"));
const Reports = React.lazy(() => import("@/pages/reports"));
const Helps = React.lazy(() => import("@/pages/helps"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore().isLoggedIn;

  // const { data: isInitialAdmin } = useIsInitialAdmin();

  // if (!isInitialAdmin) {
  //   return <Navigate to="/register" replace />;
  // }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

interface RouteType {
  path: string;
  element: React.ReactNode;
  protected: boolean;
}

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

export function AppRoutes() {
  return (
    <Routes>
      {routes.map((route) => (
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
      ))}
    </Routes>
  );
}
