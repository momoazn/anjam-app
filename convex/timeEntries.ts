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

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();

    return await Promise.all(
      entries.map(async (entry) => {
        const user = await ctx.db.get(entry.userId);
        return {
          ...entry,
          user,
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    minutes: v.number(),
    startedAt: v.optional(v.number()),
    note: v.optional(v.string()),
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

    return await ctx.db.insert("timeEntries", {
      taskId: args.taskId,
      userId,
      minutes: args.minutes,
      startedAt: args.startedAt,
      note: args.note,
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    timeEntryId: v.id("timeEntries"),
    updates: v.object({
      minutes: v.optional(v.number()),
      startedAt: v.optional(v.number()),
      note: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const entry = await ctx.db.get(args.timeEntryId);
    if (!entry) throw new Error("Time entry not found");

    // Only the creator or an owner can update?
    // Usually only the person who logged the time can update it, unless it's an admin.
    // For now, let's allow the creator and org owners.

    const task = await ctx.db.get(entry.taskId);
    if (!task) throw new Error("Task not found");

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", task.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member");

    const isOwner = membership.role === "owner";
    const isCreator = entry.userId === userId;

    if (!isOwner && !isCreator) {
      throw new Error("You don't have permission to update this time entry");
    }

    await ctx.db.patch(args.timeEntryId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { timeEntryId: v.id("timeEntries") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const entry = await ctx.db.get(args.timeEntryId);
    if (!entry) return;

    const task = await ctx.db.get(entry.taskId);
    if (!task) throw new Error("Task not found");

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", task.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member");

    const isOwner = membership.role === "owner";
    const isCreator = entry.userId === userId;

    if (!isOwner && !isCreator) {
      throw new Error("You don't have permission to delete this time entry");
    }

    await ctx.db.delete(args.timeEntryId);
  },
});
