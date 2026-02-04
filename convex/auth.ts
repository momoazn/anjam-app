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

const getTrustedOrigins = (baseUrl: string): string[] => {
  // Better Auth performs origin checks; during local development we may access Vite via
  // either `localhost` or `127.0.0.1`. Allow both when SITE_URL is one of them.
  const origins = new Set<string>();

  try {
    origins.add(new URL(baseUrl).origin);
  } catch {
    // Ignore malformed URLs; Better Auth will surface a clearer error downstream.
  }

  const localhost = "http://localhost:5173";
  const loopback = "http://127.0.0.1:5173";
  if (origins.has(localhost) || origins.has(loopback)) {
    origins.add(localhost);
    origins.add(loopback);
  }

  return [...origins];
};

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
    trustedOrigins: getTrustedOrigins(siteUrl),
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification,
    },
    plugins: [convex({ authConfig })],
  });
};
