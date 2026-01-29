import type { GenericCtx } from "@convex-dev/better-auth";
import { v } from "convex/values";

import type { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { getAuthUserId, normalizeUsername } from "./utils";

const usernameRegex = /^[a-zA-Z0-9_]+$/;

const sanitizeUsername = (username: string) =>
  username.trim().replace(/[^a-zA-Z0-9_]/g, "_");

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(
      ctx as unknown as GenericCtx<DataModel>,
    );
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
  args: {
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(
      ctx as unknown as GenericCtx<DataModel>,
    );
    let user = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .first();

    if (!user) {
      const now = Date.now();
      const name = authUser.name ?? "";
      const [firstName, ...rest] = name.split(" ").filter(Boolean);
      const lastName = rest.length ? rest.join(" ") : undefined;

      const userId = await ctx.db.insert("users", {
        authUserId: authUser._id,
        email: authUser.email ?? undefined,
        name: authUser.name ?? undefined,
        image: authUser.image ?? undefined,
        firstName,
        lastName,
        createdAt: now,
        updatedAt: now,
      });
      user = await ctx.db.get(userId);
      if (!user) {
        throw new Error("User record not found");
      }
    }

    // If username is already set, we are good
    if (user.username) {
      return;
    }

    const requestedUsername = args.username?.trim();
    const email = user.email || "";
    const baseName = email.split("@")[0] || "user";
    let username = requestedUsername
      ? sanitizeUsername(requestedUsername)
      : sanitizeUsername(baseName);
    let suffix = 1;

    if (requestedUsername) {
      if (username.length < 3) {
        throw new Error("Username must be at least 3 characters");
      }
      if (!usernameRegex.test(username)) {
        throw new Error("Username contains invalid characters");
      }
    }

    const userId = user._id;

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
    const cleaned = sanitizeUsername(args.username);
    if (cleaned.length < 3) {
      throw new Error("Username must be at least 3 characters");
    }
    if (!usernameRegex.test(cleaned)) {
      throw new Error("Username contains invalid characters");
    }
    const normalized = normalizeUsername(cleaned);

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
      username: cleaned,
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
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership || membership.status !== "active") {
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
