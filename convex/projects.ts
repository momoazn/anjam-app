import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./utils";

export const create = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    supervisorUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    // Verify org membership
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member of this organization");

    // Generate unique code (3 letters)
    // In PB this was hooked. Here we do it manually.
    // Simple approach: random 3 uppercase letters, check collision.
    // If collision, retry.
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    let tries = 0;
    while (tries < 10) {
      code = "";
      for (let i = 0; i < 3; i++) {
        code += charset.charAt(Math.floor(Math.random() * charset.length));
      }

      const existing = await ctx.db
        .query("projects")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();

      if (!existing) break;
      tries++;
    }

    if (tries >= 10) throw new Error("Failed to generate unique project code");

    const projectId = await ctx.db.insert("projects", {
      organizationId: args.organizationId,
      name: args.name,
      code,
      description: args.description,
      supervisorUserId: args.supervisorUserId,
    });

    // Initialize task counter
    await ctx.db.insert("projectCounters", {
      projectId,
      nextTaskNumber: 1,
    });

    return projectId;
  },
});

export const listByOrg = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    // Verify org membership
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member of this organization");

    return await ctx.db
      .query("projects")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) return null; // Or throw

    const supervisor = project.supervisorUserId
      ? await ctx.db.get(project.supervisorUserId)
      : null;

    return {
      ...project,
      supervisor,
    };
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      supervisorUserId: v.optional(v.id("users")),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership || membership.role !== "owner") {
      throw new Error("Only owners can update projects");
    }

    await ctx.db.patch(args.projectId, args.updates);
  },
});

export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project) return;

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership || membership.role !== "owner") {
      throw new Error("Only owners can delete projects");
    }

    await ctx.db.delete(args.projectId);
  },
});
