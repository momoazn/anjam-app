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
  // Security default: require email verification unless explicitly disabled.
  // Set `AUTH_REQUIRE_EMAIL_VERIFICATION=false` in the Convex environment to opt out (e.g. local/dev).
  const requireEmailVerification =
    process.env.AUTH_REQUIRE_EMAIL_VERIFICATION?.toLowerCase() !== "false";

  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification,
    },
    plugins: [convex({ authConfig })],
  });
};
