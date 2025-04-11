import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { AppRoutes } from "./routes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
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
