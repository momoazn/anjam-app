import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { getActiveMembership } from "./lib/auth";
import { getAuthUserId, toAuthCtx } from "./utils";

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(toAuthCtx(ctx));
    if (!authUser) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .first();
  },
});

export const ensureProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(toAuthCtx(ctx));
    // Avoid spamming Convex logs with "Unauthenticated" during logout/session races.
    // Callers can treat a null return as a no-op.
    if (!authUser) {
      return null;
    }
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .first();

    if (existingUser) {
      return existingUser;
    }

    const now = Date.now();
    // Use Better Auth's name (from registration) or generate from email
    const displayName =
      authUser.name || authUser.email?.split("@")[0] || "User";

    const userId = await ctx.db.insert("users", {
      authUserId: authUser._id,
      email: authUser.email ?? undefined,
      displayName,
      image: authUser.image ?? undefined,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(userId);
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const updates: {
      displayName?: string;
      updatedAt: number;
    } = { updatedAt: Date.now() };

    if (args.displayName !== undefined) {
      updates.displayName = args.displayName || undefined;
    }

    await ctx.db.patch(userId, updates);
  },
});

export const list = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const membership = await getActiveMembership(
      ctx,
      args.organizationId,
      userId,
    );
    if (!membership) {
      throw new Error("Forbidden");
    }

    const members = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const users = await Promise.all(members.map((m) => ctx.db.get(m.userId)));
    return users.filter((u): u is NonNullable<typeof u> => u !== null);
  },
});

export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    const user = await ctx.db.get(args.id);
    if (!user) return null;

    // Always allow reading own user document.
    if (args.id === currentUserId) {
      return user;
    }

    // Otherwise, only allow if the requester shares an active organization with the target user.
    const [requesterMemberships, targetMemberships] = await Promise.all([
      ctx.db
        .query("organizationMembers")
        .withIndex("by_user", (q) => q.eq("userId", currentUserId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect(),
      ctx.db
        .query("organizationMembers")
        .withIndex("by_user", (q) => q.eq("userId", args.id))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect(),
    ]);

    const requesterOrgIds = new Set(
      requesterMemberships.map((m) => m.organizationId),
    );
    const sharesOrg = targetMemberships.some((m) =>
      requesterOrgIds.has(m.organizationId),
    );

    if (!sharesOrg) {
      return null;
    }

    return user;
  },
});
