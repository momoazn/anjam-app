import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireOrgOwnerMembership } from "./lib/auth";
import { getAuthUserId } from "./utils";

export const createLink = mutation({
  args: {
    organizationId: v.id("organizations"),
    maxUses: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    await requireOrgOwnerMembership(
      ctx,
      args.organizationId,
      userId,
      "Only owners can create invite links",
    );

    if (
      args.maxUses !== undefined &&
      (!Number.isInteger(args.maxUses) || args.maxUses < 1)
    ) {
      throw new Error("Max uses must be a whole number of at least 1");
    }
    if (args.expiresAt !== undefined && !(args.expiresAt > Date.now())) {
      throw new Error("Expiry must be in the future");
    }

    // Generate token
    const token = crypto.randomUUID();

    await ctx.db.insert("invites", {
      token,
      organizationId: args.organizationId,
      role: "member", // Fixed to member in v1
      maxUses: args.maxUses,
      expiresAt: args.expiresAt,
      uses: 0,
      inviterId: userId,
    });

    return token;
  },
});

export const list = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    await requireOrgOwnerMembership(
      ctx,
      args.organizationId,
      userId,
      "Only owners can view invite links",
    );

    const invites = await ctx.db
      .query("invites")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    return invites;
  },
});

export const revoke = mutation({
  args: { inviteId: v.id("invites") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) return;

    await requireOrgOwnerMembership(
      ctx,
      invite.organizationId,
      userId,
      "Only owners can revoke invites",
    );

    await ctx.db.delete(args.inviteId);
  },
});

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invite) return null;

    if (invite.expiresAt !== undefined && invite.expiresAt < Date.now()) {
      return { status: "expired" as const };
    }
    if (invite.maxUses !== undefined && invite.uses >= invite.maxUses) {
      return { status: "exhausted" as const };
    }

    const org = await ctx.db.get(invite.organizationId);
    const inviter = await ctx.db.get(invite.inviterId);

    return {
      status: "valid" as const,
      organizationName: org?.name,
      inviterName: inviter?.displayName || inviter?.email || "Someone",
    };
  },
});

export const acceptExistingUser = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const invite = await ctx.db
      .query("invites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invite) throw new Error("Invalid invite");

    // Validation
    if (invite.expiresAt !== undefined && invite.expiresAt < Date.now()) {
      throw new Error("Invite expired");
    }
    if (invite.maxUses !== undefined && invite.uses >= invite.maxUses) {
      throw new Error("Invite exhausted");
    }

    // Check if already member
    const existing = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", invite.organizationId).eq("userId", userId),
      )
      .first();

    if (existing) {
      return { organizationId: invite.organizationId, alreadyMember: true };
    }

    // Join
    await ctx.db.insert("organizationMembers", {
      organizationId: invite.organizationId,
      userId,
      role: invite.role,
      status: "active",
      invitedByUserId: invite.inviterId,
      joinedAt: Date.now(),
      onboardingCompleted: true,
    });

    // Increment uses
    await ctx.db.patch(invite._id, { uses: invite.uses + 1 });

    return { organizationId: invite.organizationId };
  },
});
