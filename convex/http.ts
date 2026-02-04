import { httpRouter } from "convex/server";

import { authComponent, createAuth } from "./auth";

const http = httpRouter();

const getAllowedOrigins = (): string[] => {
  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) return [];

  const origins = new Set<string>();
  origins.add(siteUrl);

  // Allow both loopback hostnames during local development.
  const localhost = "http://localhost:5173";
  const loopback = "http://127.0.0.1:5173";
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
