import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireOrgMembership, requireOrgOwnerMembership } from "./lib/auth";
import { getAuthUserId } from "./utils";

export const listByOrg = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    await requireOrgMembership(ctx, args.organizationId, userId);

    const members = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    return await Promise.all(
      members.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return {
          ...m,
          user,
        };
      }),
    );
  },
});

export const remove = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const requesterId = await getAuthUserId(ctx);
    await requireOrgOwnerMembership(
      ctx,
      args.organizationId,
      requesterId,
      "Only owners can remove members",
    );

    const targetMembership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.userId),
      )
      .first();

    if (!targetMembership) {
      return;
    }

    await ctx.db.delete(targetMembership._id);
  },
});

export const updateRole = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const requesterId = await getAuthUserId(ctx);
    await requireOrgOwnerMembership(
      ctx,
      args.organizationId,
      requesterId,
      "Only owners can update member roles",
    );

    const targetMembership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.userId),
      )
      .first();

    if (!targetMembership) {
      throw new Error("Member not found in organization");
    }

    if (targetMembership.role === args.role) {
      return targetMembership;
    }

    if (targetMembership.role === "owner" && args.role === "member") {
      const owners = await ctx.db
        .query("organizationMembers")
        .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
        .filter((q) =>
          q.and(
            q.eq(q.field("role"), "owner"),
            q.eq(q.field("status"), "active"),
          ),
        )
        .collect();

      const isLastOwner =
        owners.length === 1 && owners[0]?.userId === targetMembership.userId;
      if (isLastOwner) {
        throw new Error("Cannot demote the last organization owner");
      }
    }

    await ctx.db.patch(targetMembership._id, { role: args.role });
    return await ctx.db.get(targetMembership._id);
  },
});
