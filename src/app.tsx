import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { AppRoutes } from "./routes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="bg-background text-foreground min-h-screen">
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center">
                <div className="text-xl">Loading...</div>
              </div>
            }
          >
            <AppRoutes />
          </Suspense>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
