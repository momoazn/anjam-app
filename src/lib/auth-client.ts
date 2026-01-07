import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const convexSiteUrl =
  (import.meta.env.VITE_CONVEX_SITE_URL as string | undefined) ??
  (convexUrl ? convexUrl.replace(".convex.cloud", ".convex.site") : undefined);

export const authClient = createAuthClient({
  baseURL: convexSiteUrl ? `${convexSiteUrl}/api/auth` : "/api/auth",
  plugins: [convexClient()],
});
