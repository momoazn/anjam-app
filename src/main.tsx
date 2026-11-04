import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./app";
import { AuthStateSync } from "./components/auth/auth-state-sync";
import "./index.css";
import { authClient } from "./lib/auth-client";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
if (!convexUrl) {
  throw new Error(
    "VITE_CONVEX_URL is missing. Set it in .env.local before starting Vite.",
  );
}
const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <AuthStateSync />
      <App />
    </ConvexBetterAuthProvider>
  </StrictMode>,
);
