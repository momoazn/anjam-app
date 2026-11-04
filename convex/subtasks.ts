import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import {
  assertOrgRefs,
  canEditTask,
  requireOrgMembership,
  requireTaskAccess,
} from "./lib/auth";
import { MAX_TITLE, cleanText } from "./lib/validation";
import { getAuthUserId } from "./utils";

async function requireSubtaskEdit(
  ctx: QueryCtx | MutationCtx,
  taskId: Id<"tasks">,
  userId: Id<"users">,
) {
  const { task, membership } = await requireTaskAccess(ctx, taskId, userId);
  if (!canEditTask(membership, task, userId)) {
    throw new Error(
      "You can only edit subtasks of tasks you created or are assigned to",
    );
  }
  return task;
}

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.deletedAt !== undefined) return [];

    await requireOrgMembership(ctx, task.organizationId, userId);

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
      }),
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
    const task = await requireSubtaskEdit(ctx, args.taskId, userId);
    await assertOrgRefs(ctx, task.organizationId, {
      userIds: [args.assigneeUserId],
    });
    if (!Number.isFinite(args.order)) {
      throw new Error("Order must be a finite number");
    }

    return await ctx.db.insert("subtasks", {
      taskId: args.taskId,
      title: cleanText(args.title, "Title", MAX_TITLE),
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
      assigneeUserId: v.optional(v.union(v.id("users"), v.null())),
      isDone: v.optional(v.boolean()),
      order: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const subtask = await ctx.db.get(args.subtaskId);
    if (!subtask) throw new Error("Subtask not found");

    const task = await requireSubtaskEdit(ctx, subtask.taskId, userId);
    await assertOrgRefs(ctx, task.organizationId, {
      userIds: [args.updates.assigneeUserId],
    });

    const { title, assigneeUserId, isDone, order } = args.updates;
    if (order !== undefined && !Number.isFinite(order)) {
      throw new Error("Order must be a finite number");
    }
    await ctx.db.patch(args.subtaskId, {
      ...(title !== undefined && {
        title: cleanText(title, "Title", MAX_TITLE),
      }),
      ...(assigneeUserId !== undefined && {
        assigneeUserId: assigneeUserId ?? undefined,
      }),
      ...(isDone !== undefined && { isDone }),
      ...(order !== undefined && { order }),
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

    await requireSubtaskEdit(ctx, subtask.taskId, userId);

    await ctx.db.delete(args.subtaskId);
  },
});
