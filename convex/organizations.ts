import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireOrgMembership, requireOrgOwnerMembership } from "./lib/auth";
import { generateSlug, getAuthUserId, getAuthUserIdIfExists } from "./utils";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const slug = generateSlug(args.name);

    // Ensure slug uniqueness
    let finalSlug = slug;
    let suffix = 1;
    while (true) {
      const existing = await ctx.db
        .query("organizations")
        .withIndex("by_slug", (q) => q.eq("slug", finalSlug))
        .first();
      if (!existing) break;
      finalSlug = `${slug}-${suffix}`;
      suffix++;
    }

    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      slug: finalSlug,
      description: args.description,
      active: true,
      plan: "free",
      settings: {},
    });

    await ctx.db.insert("organizationMembers", {
      organizationId: orgId,
      userId,
      role: "owner",
      status: "active",
      onboardingCompleted: false,
      joinedAt: Date.now(),
    });

    return orgId;
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    // Avoid hard-failing the app bootstrap for freshly-created auth users.
    // AuthStateSync will call `users.ensureProfile` if `users.getMe` returns null,
    // but it also calls this query; if we throw here, the profile creation never runs.
    const userId = await getAuthUserIdIfExists(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const orgs = await Promise.all(
      memberships.map(async (m) => {
        const org = await ctx.db.get(m.organizationId);
        if (!org) return null;
        return { ...org, membership: m };
      }),
    );

    return orgs.filter((o) => o !== null);
  },
});

export const setOnboardingCompleted = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const membership = await requireOrgMembership(
      ctx,
      args.organizationId,
      userId,
    );

    await ctx.db.patch(membership._id, {
      onboardingCompleted: true,
    });
  },
});

export const update = mutation({
  args: {
    organizationId: v.id("organizations"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      slug: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    await requireOrgOwnerMembership(
      ctx,
      args.organizationId,
      userId,
      "Only owners can update organization settings",
    );

    await ctx.db.patch(args.organizationId, args.updates);
  },
});
