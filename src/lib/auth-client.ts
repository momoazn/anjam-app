import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const convexSiteUrl =
  (import.meta.env.VITE_CONVEX_SITE_URL as string | undefined) ??
  (convexUrl ? convexUrl.replace(".convex.cloud", ".convex.site") : undefined);

export const authClient = createAuthClient({
  // In local development, use a same-origin `/api/auth` endpoint so the browser can persist
  // auth cookies for `http://127.0.0.1:4112`. Vite proxies this route to the Convex HTTP endpoint.
  baseURL: import.meta.env.DEV
    ? typeof window !== "undefined"
      ? new URL("/api/auth", window.location.origin).toString()
      : "/api/auth"
    : convexSiteUrl
      ? `${convexSiteUrl}/api/auth`
      : "/api/auth",
  plugins: [convexClient()],
});
