import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/auth-store";
import { AppRoutes } from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes by default
      // cacheTime: 30 * 60 * 1000, // Cache persists for 30 minutes by default
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1, // Only retry failed requests once
      networkMode: "offlineFirst", // Prefer cached data when offline
    },
    mutations: {
      retry: 1, // Only retry failed mutations once
    },
  },
});

function App() {
  const isLoggedIn = useAuthStore().isLoggedIn;

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <SidebarProvider>
          {isLoggedIn && <AppSidebar variant="inset" />}
          <SidebarInset>
            {isLoggedIn && <SiteHeader />}
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center">
                  <div className="text-xl">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              }
            >
              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col gap-6">
                    <AppRoutes />
                  </div>
                </div>
              </div>
            </Suspense>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
