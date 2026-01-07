import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getAuthUserId, normalizeUsername } from "./utils";

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await getAuthUserId(ctx);
      const user = await ctx.db.get(userId);
      return user;
    } catch {
      return null;
    }
  },
});

export const ensureProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User record not found");
    }

    // If username is already set, we are good
    if (user.username) {
      return;
    }

    // Generate username from email
    const email = user.email || "";
    const baseName = email.split("@")[0] || "user";
    let username = baseName;
    let suffix = 1;

    // Ensure uniqueness
    while (true) {
      const normalized = normalizeUsername(username);
      const existing = await ctx.db
        .query("users")
        .withIndex("by_usernameNormalized", (q) =>
          q.eq("usernameNormalized", normalized),
        )
        .first();

      if (!existing || existing._id === userId) {
        break;
      }

      username = `${baseName}${suffix}`;
      suffix++;
    }

    await ctx.db.patch(userId, {
      username,
      usernameNormalized: normalizeUsername(username),
      createdAt: user.createdAt || Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const setUsername = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const normalized = normalizeUsername(args.username);

    // Check uniqueness
    const existing = await ctx.db
      .query("users")
      .withIndex("by_usernameNormalized", (q) =>
        q.eq("usernameNormalized", normalized),
      )
      .first();

    if (existing && existing._id !== userId) {
      throw new Error("Username already taken");
    }

    await ctx.db.patch(userId, {
      username: args.username,
      usernameNormalized: normalized,
      updatedAt: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    await ctx.db.patch(userId, {
      firstName: args.firstName,
      lastName: args.lastName,
      updatedAt: Date.now(),
    });
  },
});

export const list = query({
  args: {
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    // If organizationId is provided, filter by membership
    if (args.organizationId) {
      const members = await ctx.db
        .query("organizationMembers")
        .withIndex("by_org", (q) =>
          q.eq("organizationId", args.organizationId!),
        )
        .collect();

      const userIds = members.map((m) => m.userId);
      const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
      return users.filter((u): u is NonNullable<typeof u> => u !== null);
    }

    // Otherwise return all users (admin view or legacy fallback)
    return await ctx.db.query("users").collect();
  },
});

export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
