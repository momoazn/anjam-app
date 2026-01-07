import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./app";
import { ConvexAuthStateSync } from "./components/auth/convex-auth-sync";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
if (!convexUrl) {
  throw new Error(
    "VITE_CONVEX_URL is missing. Set it in .env.local before starting Vite.",
  );
}
const convex = new ConvexReactClient(convexUrl);
const storageNamespace = convexUrl;

const root = createRoot(document.getElementById("root")!);
const isDevelopment = import.meta.env.MODE === "development";

if (isDevelopment) {
  root.render(
    <StrictMode>
      <ConvexAuthProvider client={convex} storageNamespace={storageNamespace}>
        <ConvexAuthStateSync />
        <App />
      </ConvexAuthProvider>
    </StrictMode>,
  );
} else {
  import("posthog-js/react").then(({ PostHogProvider }) => {
    root.render(
      <StrictMode>
        <PostHogProvider
          apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
          options={{
            api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
            defaults: "2025-05-24",
            capture_exceptions: true,
            debug: false,
          }}
        >
          <ConvexAuthProvider
            client={convex}
            storageNamespace={storageNamespace}
          >
            <ConvexAuthStateSync />
            <App />
          </ConvexAuthProvider>
        </PostHogProvider>
      </StrictMode>,
    );
  });
}
