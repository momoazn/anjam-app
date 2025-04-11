import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import NewDashboard from "@/pages/new-dashboard";

// Lazy load pages
const Login = React.lazy(() => import("@/pages/login"));
const Dashboard = React.lazy(() => import("@/pages/dashboard"));
const Tasks = React.lazy(() => import("@/pages/tasks"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-dashboard"
        element={
          <ProtectedRoute>
            <NewDashboard />
          </ProtectedRoute>
        }
      />
      {/* More routes will be added here */}
    </Routes>
  );
}
