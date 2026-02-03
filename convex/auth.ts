import { type GenericCtx, createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";

import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL;
if (!siteUrl) {
  throw new Error("SITE_URL is missing. Set it in your Convex environment.");
}

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  // Email verification is disabled by default for better UX.
  // Set `AUTH_REQUIRE_EMAIL_VERIFICATION=true` in the Convex environment to enable it.
  const requireEmailVerification =
    process.env.AUTH_REQUIRE_EMAIL_VERIFICATION?.toLowerCase() === "true";

  // Better Auth secret for session security (generate a secure random string)
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET is missing. Set it in your Convex environment variables.",
    );
  }

  return betterAuth({
    secret,
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification,
    },
    plugins: [convex({ authConfig })],
  });
};
