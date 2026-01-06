import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./utils";

export const createLink = mutation({
  args: {
    organizationId: v.id("organizations"),
    maxUses: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership || membership.role !== "owner") {
      throw new Error("Only owners can create invite links");
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

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership || membership.role !== "owner") {
      throw new Error("Only owners can view invite links");
    }

    const invites = await ctx.db
      .query("invites")
      .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
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

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", invite.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership || membership.role !== "owner") {
      throw new Error("Only owners can revoke invites");
    }

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

    if (invite.expiresAt && invite.expiresAt < Date.now()) {
      return { status: "expired" as const };
    }
    if (invite.maxUses && invite.uses >= invite.maxUses) {
      return { status: "exhausted" as const };
    }

    const org = await ctx.db.get(invite.organizationId);
    const inviter = await ctx.db.get(invite.inviterId);

    return {
      status: "valid" as const,
      invite,
      orgName: org?.name,
      inviterName: inviter?.username || inviter?.name || "Someone",
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
    if (invite.expiresAt && invite.expiresAt < Date.now()) {
      throw new Error("Invite expired");
    }
    if (invite.maxUses && invite.uses >= invite.maxUses) {
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
      onboardingCompleted: false,
    });

    // Increment uses
    await ctx.db.patch(invite._id, { uses: invite.uses + 1 });

    return { organizationId: invite.organizationId };
  },
});
