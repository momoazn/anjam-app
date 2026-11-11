import { httpRouter } from "convex/server";

import { authComponent, createAuth } from "./auth";

const http = httpRouter();

const getAllowedOrigins = (): string[] => {
  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) return [];

  const origins = new Set<string>();
  // CORS compares origins, so drop any path (e.g. https://user.github.io/anjam).
  origins.add(new URL(siteUrl).origin);

  // Allow both loopback hostnames during local development.
  const localhost = "http://localhost:4112";
  const loopback = "http://127.0.0.1:4112";
  if (siteUrl === localhost || siteUrl === loopback) {
    origins.add(localhost);
    origins.add(loopback);
  }

  return [...origins];
};

authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins: getAllowedOrigins(),
  },
});

export default http;
