import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "./routes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <Router>
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center">
                  <div className="text-xl">Loading...</div>
                </div>
              }
            >
              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <AppRoutes />
                  </div>
                </div>
              </div>
            </Suspense>
          </Router>
        </SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  );
}

export default App;
