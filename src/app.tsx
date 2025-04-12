import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/auth-store";
import { AppRoutes } from "./router";

const queryClient = new QueryClient();

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
                  <div className="text-xl">Loading...</div>
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
