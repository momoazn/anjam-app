import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import {
  assertOrgRefs,
  getActiveMembership,
  requireOrgMembership,
  requireOrgOwnerMembership,
} from "./lib/auth";
import {
  MAX_NAME,
  MAX_TEXT,
  cleanOptionalText,
  cleanText,
} from "./lib/validation";
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

    await requireOrgMembership(ctx, args.organizationId, userId);
    await assertOrgRefs(ctx, args.organizationId, {
      userIds: [args.supervisorUserId],
    });
    const name = cleanText(args.name, "Name", MAX_NAME);
    const description = args.description
      ? cleanOptionalText(args.description, "Description", MAX_TEXT)
      : undefined;

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
      name,
      code,
      description,
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

    await requireOrgMembership(ctx, args.organizationId, userId);

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

    const membership = await getActiveMembership(
      ctx,
      project.organizationId,
      userId,
    );
    if (!membership) return null;

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

    await requireOrgOwnerMembership(
      ctx,
      project.organizationId,
      userId,
      "Only owners can update projects",
    );

    await assertOrgRefs(ctx, project.organizationId, {
      userIds: [args.updates.supervisorUserId],
    });

    const { name, description, supervisorUserId } = args.updates;
    await ctx.db.patch(args.projectId, {
      ...(name !== undefined && { name: cleanText(name, "Name", MAX_NAME) }),
      ...(description !== undefined && {
        description: cleanOptionalText(description, "Description", MAX_TEXT),
      }),
      ...(supervisorUserId !== undefined && { supervisorUserId }),
    });
  },
});

export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project) return;

    await requireOrgOwnerMembership(
      ctx,
      project.organizationId,
      userId,
      "Only owners can delete projects",
    );

    // ponytail: one mutation deletes everything. Very large projects can hit
    // Convex per-mutation limits; move to a scheduled batch delete if needed.
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const task of tasks) {
      const comments = await ctx.db
        .query("comments")
        .withIndex("by_taskId", (q) => q.eq("taskId", task._id))
        .collect();
      for (const comment of comments) {
        const mentions = await ctx.db
          .query("mentions")
          .withIndex("by_comment", (q) => q.eq("commentId", comment._id))
          .collect();
        for (const mention of mentions) await ctx.db.delete(mention._id);
        await ctx.db.delete(comment._id);
      }
      const subtasks = await ctx.db
        .query("subtasks")
        .withIndex("by_taskId", (q) => q.eq("taskId", task._id))
        .collect();
      for (const subtask of subtasks) await ctx.db.delete(subtask._id);
      await ctx.db.delete(task._id);
    }
    const counters = await ctx.db
      .query("projectCounters")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const counter of counters) await ctx.db.delete(counter._id);

    await ctx.db.delete(args.projectId);
  },
});
