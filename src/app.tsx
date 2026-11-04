import { useConvex } from "convex/react";
import { Loader2 } from "lucide-react";
import { NuqsAdapter } from "nuqs/adapters/react-router/v6";
import { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Toaster } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { CommandMenu } from "@/components/command-menu";
import { ErrorBoundary } from "@/components/error-boundary";
import { KeyboardShortcutsDialog } from "@/components/help/keyboard-shortcuts-dialog";
import { ModalManager } from "@/components/modals/modal-manager";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { app, loading } from "@/constants";
import { useNotifications } from "@/hooks/notifications";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useTheme } from "@/hooks/use-theme";
import { useAuthIsAuthenticated } from "@/store/app-context-store";

import { AppRoutes } from "./router";

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex h-svh items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
        <p className="text-muted-foreground text-sm">{loading.application}</p>
      </div>
    </div>
  );
}

// Main content component
function MainContent() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6">
          <AppRoutes />
        </div>
      </div>
    </div>
  );
}

// Layout component
function AppLayout() {
  const isLoggedIn = useAuthIsAuthenticated();
  const location = useLocation();
  useNotifications(); // Auto-subscribes
  useKeyboardShortcuts(); // Global keyboard shortcuts

  const isLandingPage = location.pathname === "/";

  if (isLandingPage) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <MainContent />
      </Suspense>
    );
  }

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      {isLoggedIn && <AppSidebar variant="inset" />}
      <SidebarInset className="overscroll-behavior-none min-h-0 overflow-x-hidden overflow-y-auto">
        {isLoggedIn && <SiteHeader />}
        <Suspense fallback={<LoadingFallback />}>
          <MainContent />
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Dev only: warns when the Convex websocket is down. Renders nothing otherwise.
function ConnectionWarning() {
  const convex = useConvex();
  const [connected, setConnected] = useState(
    () => convex.connectionState().isWebSocketConnected,
  );

  useEffect(
    () =>
      convex.subscribeToConnectionState((state) =>
        setConnected(state.isWebSocketConnected),
      ),
    [convex],
  );

  if (connected) return null;
  return (
    <div
      role="status"
      className="fixed start-3 bottom-3 z-50 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-700 shadow-sm dark:text-amber-400"
    >
      {app.connectionLost}
    </div>
  );
}

function App() {
  useTheme();

  return (
    <ErrorBoundary>
      <Router>
        <NuqsAdapter>
          <ScrollToTop />
          <AppLayout />
          <CommandMenu />
          <KeyboardShortcutsDialog />
          <ModalManager />
          <Toaster
            position="bottom-right"
            className="font-arad"
            toastOptions={{
              duration: 3000,
              className:
                "rounded-xl border-border/40 bg-card/80 backdrop-blur-md text-foreground shadow-2xl",
            }}
          />
          {import.meta.env.DEV && <ConnectionWarning />}
        </NuqsAdapter>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
