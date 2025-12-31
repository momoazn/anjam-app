import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { NuqsAdapter } from "nuqs/adapters/react-router/v6";
import { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Toaster } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { ErrorBoundary } from "@/components/error-boundary";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { loading } from "@/constants";
import { useNotifications } from "@/hooks/notifications";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useTheme } from "@/hooks/use-theme";
import { useAuthIsLoggedIn } from "@/store/auth-store";

import { AppRoutes } from "./router";

type RetryableError = {
  status?: number;
};

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      refetchOnMount: true, // Refetch only if data is stale
      retry: (failureCount, error) => {
        const status = (error as RetryableError | undefined)?.status;
        if (status && [400, 401, 403, 404].includes(status)) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      placeholderData: keepPreviousData,
    },
  },
});

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
  const isLoggedIn = useAuthIsLoggedIn();
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

function App() {
  useTheme();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <NuqsAdapter>
            <ScrollToTop />
            <AppLayout />
            <Toaster
              position="bottom-right"
              className="font-arad"
              toastOptions={{
                duration: 3000,
              }}
            />
          </NuqsAdapter>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
