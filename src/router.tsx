import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAuthStore } from "./store/auth-store";

// Lazy load pages
const Login = React.lazy(() => import("@/pages/login"));
const Register = React.lazy(() => import("@/pages/register"));
const Dashboard = React.lazy(() => import("@/pages/dashboard"));
const Projects = React.lazy(() => import("@/pages/projects"));
const Tasks = React.lazy(() => import("@/pages/tasks"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore().isLoggedIn;

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
