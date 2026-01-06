import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./utils";

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) return [];

    // Check membership
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", task.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member of this organization");

    const subtasks = await ctx.db
      .query("subtasks")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();

    return await Promise.all(
      subtasks.map(async (subtask) => {
        const assignee = subtask.assigneeUserId
          ? await ctx.db.get(subtask.assigneeUserId)
          : null;
        return {
          ...subtask,
          assignee,
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.string(),
    assigneeUserId: v.optional(v.id("users")),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", task.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member");

    return await ctx.db.insert("subtasks", {
      taskId: args.taskId,
      title: args.title,
      assigneeUserId: args.assigneeUserId,
      isDone: false,
      order: args.order,
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    subtaskId: v.id("subtasks"),
    updates: v.object({
      title: v.optional(v.string()),
      assigneeUserId: v.optional(v.id("users")),
      isDone: v.optional(v.boolean()),
      order: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const subtask = await ctx.db.get(args.subtaskId);
    if (!subtask) throw new Error("Subtask not found");

    const task = await ctx.db.get(subtask.taskId);
    if (!task) throw new Error("Task not found");

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", task.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member");

    await ctx.db.patch(args.subtaskId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { subtaskId: v.id("subtasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const subtask = await ctx.db.get(args.subtaskId);
    if (!subtask) return;

    const task = await ctx.db.get(subtask.taskId);
    if (!task) throw new Error("Task not found");

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", task.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member");

    await ctx.db.delete(args.subtaskId);
  },
});
