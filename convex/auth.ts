import { type GenericCtx, createClient } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";

import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL;
if (!siteUrl) {
  throw new Error("SITE_URL is missing. Set it in your Convex environment.");
}

const parseBooleanEnv = (value: string | undefined, defaultValue: boolean) => {
  if (value == null) return defaultValue;
  return value.toLowerCase() === "true";
};

const parsePositiveIntEnv = (
  value: string | undefined,
  defaultValue: number,
) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
};

const getTrustedOrigins = (baseUrl: string): string[] => {
  // Better Auth performs origin checks; during local development we may access Vite via
  // either `localhost` or `127.0.0.1`. Allow both when SITE_URL is one of them.
  const origins = new Set<string>();

  try {
    origins.add(new URL(baseUrl).origin);
  } catch {
    // Ignore malformed URLs; Better Auth will surface a clearer error downstream.
  }

  const localhost = "http://localhost:4112";
  const loopback = "http://127.0.0.1:4112";
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

  // Auth rate-limiting is enabled by default in production and can be tuned via env vars.
  const rateLimitEnabled = parseBooleanEnv(
    process.env.AUTH_RATE_LIMIT_ENABLED,
    process.env.NODE_ENV === "production",
  );
  const globalRateLimitWindowSeconds = parsePositiveIntEnv(
    process.env.AUTH_RATE_LIMIT_WINDOW_SECONDS,
    60,
  );
  const globalRateLimitMax = parsePositiveIntEnv(
    process.env.AUTH_RATE_LIMIT_MAX,
    120,
  );
  const signInRateLimitWindowSeconds = parsePositiveIntEnv(
    process.env.AUTH_SIGNIN_RATE_LIMIT_WINDOW_SECONDS,
    15 * 60,
  );
  const signInRateLimitMax = parsePositiveIntEnv(
    process.env.AUTH_SIGNIN_RATE_LIMIT_MAX,
    5,
  );
  const signUpRateLimitWindowSeconds = parsePositiveIntEnv(
    process.env.AUTH_SIGNUP_RATE_LIMIT_WINDOW_SECONDS,
    60 * 60,
  );
  const signUpRateLimitMax = parsePositiveIntEnv(
    process.env.AUTH_SIGNUP_RATE_LIMIT_MAX,
    10,
  );

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
    rateLimit: {
      enabled: rateLimitEnabled,
      storage: "database",
      window: globalRateLimitWindowSeconds,
      max: globalRateLimitMax,
      customRules: {
        "/sign-in/*": {
          window: signInRateLimitWindowSeconds,
          max: signInRateLimitMax,
        },
        "/sign-up/*": {
          window: signUpRateLimitWindowSeconds,
          max: signUpRateLimitMax,
        },
      },
    },
    // crossDomain keeps the session in the client, so a frontend on another
    // domain (for example GitHub Pages) works without third-party cookies.
    plugins: [crossDomain({ siteUrl }), convex({ authConfig })],
  });
};
