import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./app";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
const isDevelopment = import.meta.env.MODE === "development";

console.log("[Anjam] Environment:", {
  mode: import.meta.env.MODE,
  isDevelopment,
  posthogEnabled: !isDevelopment,
});

if (isDevelopment) {
  // In development, render without PostHog
  console.log("[Anjam] PostHog disabled - running in development mode");
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  // Only import and initialize PostHog in production
  console.log("[Anjam] PostHog enabled - running in production mode");
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
          <App />
        </PostHogProvider>
      </StrictMode>,
    );
  });
}
