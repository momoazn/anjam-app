import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { ErrorBoundary } from "@/components/error-boundary";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/use-theme";
import { useTabVisibility } from "@/hooks/use-tab-visibility";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { useLoadNotifications } from "@/hooks/use-load-notifications";
import { notificationSoundManager } from "@/lib/notification-sounds";
import { useAuthIsLoggedIn } from "@/store/auth-store";
import { Loader2 } from "lucide-react";
import { TEXT } from "./constants/text";
import { AppRoutes } from "./router";

// Simplified QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      retry: 1, // Simple retry logic
    },
  },
});

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="text-primary size-8 animate-spin" />
        <p className="text-muted-foreground text-sm">
          {TEXT.loading.application}
        </p>
      </div>
    </div>
  );
}

// Main content component
function MainContent() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
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
  useLoadNotifications();

  return (
    <SidebarProvider>
      {isLoggedIn && <AppSidebar variant="inset" />}
      <SidebarInset>
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
  useTabVisibility();
  useRealtimeNotifications();

  // Initialize notification sound manager
  useEffect(() => {
    notificationSoundManager.initialize();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ScrollToTop />
          <AppLayout />
          <Toaster
            position="bottom-left"
            className="font-vazirmatn"
            toastOptions={{
              duration: 4000,
            }}
          />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
