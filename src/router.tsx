import React, { useEffect } from "react";
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
const Settings = React.lazy(() =>
  import("@/pages/settings").catch(() => ({
    default: () => <div>{TEXT.errors.pageLoad.settings}</div>,
  })),
);
const Notifications = React.lazy(() =>
  import("@/pages/notifications").catch(() => ({
    default: () => <div>{TEXT.errors.pageLoad.notifications}</div>,
  })),
);
const NotFound = React.lazy(() =>
  import("@/pages/not-found").catch(() => ({
    default: () => <div>صفحه یافت نشد</div>,
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

// PublicRoute component (redirects authenticated users to home)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthIsLoggedIn();
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

interface RouteType {
  path: string;
  element: React.ReactNode;
  protected: boolean;
  title?: string;
}

// Sets document.title when mounted
const Title = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if (title) document.title = `${title} • ${TEXT.app.name}`;
    else document.title = TEXT.app.name;
  }, [title]);
  return <>{children}</>;
};

// Memoized routes configuration
const routes: RouteType[] = [
  {
    path: "/",
    element: <Dashboard />,
    protected: true,
    title: TEXT.navigation.dashboard,
  },
  {
    path: "/projects",
    element: <Projects />,
    protected: true,
    title: TEXT.navigation.projects,
  },
  {
    path: "/login",
    element: <Login />,
    protected: false,
    title: TEXT.auth.login.title,
  },
  {
    path: "/register",
    element: <Register />,
    protected: false,
    title: TEXT.auth.register.title,
  },
  {
    path: "/tasks",
    element: <Tasks />,
    protected: true,
    title: TEXT.tasks.title,
  },
  {
    path: "/projects/:id/tasks",
    element: <ProjectTasks />,
    protected: true,
    title: TEXT.projects.projectTasks,
  },
  {
    path: "/users",
    element: <Users />,
    protected: true,
    title: TEXT.users.title,
  },
  {
    path: "/projects/:id/users",
    element: <ProjectUsers />,
    protected: true,
    title: TEXT.projects.users.title,
  },
  {
    path: "/reports",
    element: <Reports />,
    protected: true,
    title: TEXT.navigation.reports,
  },
  {
    path: "/helps",
    element: <Helps />,
    protected: true,
    title: TEXT.navigation.helps,
  },
  {
    path: "/settings",
    element: <Settings />,
    protected: true,
    title: TEXT.navigation.settings,
  },
  {
    path: "/notifications",
    element: <Notifications />,
    protected: true,
    title: TEXT.navigation.notifications,
  },
  {
    path: "*",
    element: <NotFound />,
    protected: false,
    title: "404",
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
          element = <ProtectedRoute>{content}</ProtectedRoute>;
        } else if (route.path === "/login" || route.path === "/register") {
          element = <PublicRoute>{content}</PublicRoute>;
        }

        return <Route key={route.path} path={route.path} element={element} />;
      })}
    </Routes>
  );
};
