import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { pb } from "./lib/pocketbase";
import { AppRoutes } from "./router";

const queryClient = new QueryClient();

function App() {
  const isLoggedIn = pb.authStore.isValid;

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
      </Router>
    </QueryClientProvider>
  );
}

export default App;
