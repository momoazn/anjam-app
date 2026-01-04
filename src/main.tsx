import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./app";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
const isDevelopment = import.meta.env.MODE === "development";

if (isDevelopment) {
  root.render(
    <StrictMode>
      <App />
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
          <App />
        </PostHogProvider>
      </StrictMode>,
    );
  });
}
