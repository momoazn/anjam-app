import { Auth } from "convex/server";

import { Id } from "./_generated/dataModel";

export const getAuthUserId = async (ctx: { auth: Auth }) => {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Unauthenticated");
  }
  const [userId] = identity.subject.split("|");
  return userId as Id<"users">;
};

export const normalizeUsername = (username: string) => {
  return username.trim().toLowerCase();
};

export const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
