import type { GenericCtx } from "@convex-dev/better-auth";
import type { Auth } from "convex/server";

import type { Id } from "./_generated/dataModel";
import type { DataModel } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";

type AuthedCtx = QueryCtx | MutationCtx;

export const getAuthUserIdIfExists = async (
  ctx: AuthedCtx & { auth: Auth },
): Promise<Id<"users"> | null> => {
  const authUser = await authComponent.safeGetAuthUser(
    ctx as unknown as GenericCtx<DataModel>,
  );
  if (!authUser) return null;

  const appUser = await ctx.db
    .query("users")
    .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
    .first();

  return (appUser?._id as Id<"users"> | undefined) ?? null;
};

export const getAuthUserId = async (ctx: AuthedCtx & { auth: Auth }) => {
  const authUser = await authComponent.getAuthUser(
    ctx as unknown as GenericCtx<DataModel>,
  );
  const appUser = await ctx.db
    .query("users")
    .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
    .first();

  if (!appUser) {
    throw new Error("User profile not found");
  }

  return appUser._id as Id<"users">;
};

export const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
