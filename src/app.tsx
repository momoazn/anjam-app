import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Suspense, memo, useMemo } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { ErrorBoundary } from "@/components/error-boundary";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TEXT } from "@/constants/text";
import { useAuthIsLoggedIn } from "@/store/auth-store";
import { useTheme } from "@/hooks/use-theme";
import { AppRoutes } from "./router";
import { ScrollToTop } from "@/components/scroll-to-top";

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // Data stays fresh for 10 minutes (increased from 5)
      gcTime: 30 * 60 * 1000, // Cache persists for 30 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false, // Don't refetch on mount if data is fresh
      refetchOnReconnect: "always", // Refetch when reconnecting to network
      retry: (failureCount, error) => {
        // Smart retry logic based on error type
        if (failureCount >= 2) return false;
        if (error?.message?.includes("401") || error?.message?.includes("403"))
          return false;
        return true;
      },
      networkMode: "offlineFirst", // Prefer cached data when offline
      structuralSharing: true, // Enable structural sharing for better performance
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry auth-related mutations
        if (error?.message?.includes("401") || error?.message?.includes("403"))
          return false;
        return failureCount < 1;
      },
      networkMode: "online", // Mutations should only run when online
    },
  },
});

// Memoized loading fallback component
const LoadingFallback = memo(() => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="text-primary size-8 animate-spin" />
      <p className="text-muted-foreground text-sm">
        {TEXT.loading.application}
      </p>
    </div>
  </div>
));

LoadingFallback.displayName = "LoadingFallback";

// Memoized main content component
const MainContent = memo(() => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6">
          <AppRoutes />
        </div>
      </div>
    </div>
  );
});

MainContent.displayName = "MainContent";

// Memoized layout component
const AppLayout = memo(() => {
  const isLoggedIn = useAuthIsLoggedIn();

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
});

AppLayout.displayName = "AppLayout";

function App() {
  // Initialize theme management
  useTheme();

  // Memoize the QueryClient to prevent recreation on every render
  const memoizedQueryClient = useMemo(() => queryClient, []);

  // Memoize the Toaster configuration
  const toasterConfig = useMemo(
    () => ({
      position: "bottom-left" as const,
      className: "font-vazirmatn",
      toastOptions: {
        duration: 4000,
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
      },
    }),
    [],
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={memoizedQueryClient}>
        <Router>
          <ScrollToTop />
          <AppLayout />
          <Toaster {...toasterConfig} />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
