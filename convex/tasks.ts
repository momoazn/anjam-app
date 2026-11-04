import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  canDeleteTask,
  canEditTask,
  requireOrgMembership,
  requireProjectAccess,
  requireTaskAccess,
} from "./lib/auth";
import { getAuthUserId } from "./utils";

const taskStatusValidator = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("in_review"),
  v.literal("done"),
  v.literal("cancelled"),
);

const taskPriorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("urgent"),
);

/** Keeps `completedAt` in sync when a task enters or leaves "done". */
function completionPatch(task: Doc<"tasks">, nextStatus?: string) {
  if (nextStatus === undefined || nextStatus === task.status) return {};
  if (nextStatus === "done") return { completedAt: Date.now() };
  return task.status === "done" ? { completedAt: undefined } : {};
}

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    assigneeUserId: v.optional(v.id("users")),
    priority: taskPriorityValidator,
    status: taskStatusValidator,
    deadline: v.optional(v.number()),
    tags: v.optional(v.array(v.id("tags"))),
    taskType: v.optional(v.string()),
    storyPoints: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const { project } = await requireProjectAccess(ctx, args.projectId, userId);

    const counter = await ctx.db
      .query("projectCounters")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .first();

    let taskNumber = 1;
    if (counter) {
      taskNumber = counter.nextTaskNumber;
      await ctx.db.patch(counter._id, { nextTaskNumber: taskNumber + 1 });
    } else {
      await ctx.db.insert("projectCounters", {
        projectId: args.projectId,
        nextTaskNumber: 2,
      });
    }

    const displayId = `${project.code}-${taskNumber.toString().padStart(3, "0")}`;

    return await ctx.db.insert("tasks", {
      projectId: args.projectId,
      organizationId: project.organizationId,
      creatorUserId: userId,
      assigneeUserId: args.assigneeUserId,
      title: args.title,
      description: args.description,
      priority: args.priority,
      status: args.status,
      deadline: args.deadline,
      order: Date.now(),
      tags: args.tags || [],
      displayId,
      taskNumber,
      taskType: args.taskType,
      storyPoints: args.storyPoints,
      createdAt: Date.now(),
      completedAt: args.status === "done" ? Date.now() : undefined,
      updatedAt: Date.now(),
    });
  },
});

export const get = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) return null;

    try {
      await requireOrgMembership(ctx, task.organizationId, userId);
    } catch {
      throw new Error("Forbidden");
    }

    const creator = await ctx.db.get(task.creatorUserId);
    const assignee = task.assigneeUserId
      ? await ctx.db.get(task.assigneeUserId)
      : null;
    const project = await ctx.db.get(task.projectId);
    const tagsData = await Promise.all(
      (task.tags || []).map((tagId) => ctx.db.get(tagId)),
    );

    return {
      ...task,
      creator,
      assignee,
      project,
      tagsData: tagsData.filter((tag) => tag !== null),
    };
  },
});

export const list = query({
  args: {
    organizationId: v.id("organizations"),
    projectId: v.optional(v.id("projects")),
    assigneeUserId: v.optional(v.id("users")),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    searchTerm: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    try {
      await requireOrgMembership(ctx, args.organizationId, userId);
    } catch {
      throw new Error("Not a member");
    }

    const baseQuery = ctx.db.query("tasks");
    let q:
      | ReturnType<typeof baseQuery.withSearchIndex>
      | ReturnType<typeof baseQuery.withIndex>;

    if (args.searchTerm) {
      q = baseQuery.withSearchIndex("search_title", (index) => {
        let search = index.search("title", args.searchTerm!);
        if (args.projectId) {
          search = search.eq("projectId", args.projectId);
        }
        return search
          .eq("organizationId", args.organizationId)
          .eq("deletedAt", undefined);
      });
    } else if (args.projectId) {
      q = baseQuery.withIndex("by_projectId", (index) =>
        index.eq("projectId", args.projectId!),
      );
    } else {
      q = baseQuery.withIndex("by_org", (index) =>
        index.eq("organizationId", args.organizationId),
      );
    }

    if (args.assigneeUserId) {
      q = q.filter((filter) =>
        filter.eq(filter.field("assigneeUserId"), args.assigneeUserId),
      );
    }

    if (args.status) {
      q = q.filter((filter) => filter.eq(filter.field("status"), args.status));
    }

    if (args.priority) {
      q = q.filter((filter) =>
        filter.eq(filter.field("priority"), args.priority),
      );
    }

    if (!args.searchTerm) {
      q = q.filter((filter) => filter.eq(filter.field("deletedAt"), undefined));
    }

    const page = await q.paginate(args.paginationOpts);

    return {
      ...page,
      page: await Promise.all(
        page.page.map(async (task) => {
          const creator = await ctx.db.get(task.creatorUserId);
          const assignee = task.assigneeUserId
            ? await ctx.db.get(task.assigneeUserId)
            : null;
          const project = await ctx.db.get(task.projectId);

          return {
            ...task,
            creator,
            assignee,
            project,
          };
        }),
      ),
    };
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(v.string()),
      priority: v.optional(v.string()),
      assigneeUserId: v.optional(v.id("users")),
      deadline: v.optional(v.number()),
      tags: v.optional(v.array(v.id("tags"))),
      taskType: v.optional(v.string()),
      storyPoints: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const { task, membership } = await requireTaskAccess(
      ctx,
      args.taskId,
      userId,
    );

    if (!canEditTask(membership, task, userId)) {
      throw new Error("You can only edit tasks you created or are assigned to");
    }

    await ctx.db.patch(args.taskId, {
      ...(args.updates as Partial<Doc<"tasks">>),
      ...completionPatch(task, args.updates.status),
      updatedAt: Date.now(),
    });
  },
});

export const softDelete = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) return;

    let membership: Doc<"organizationMembers">;
    try {
      ({ membership } = await requireTaskAccess(ctx, args.taskId, userId));
    } catch (error) {
      if (error instanceof Error && error.message === "Project not found") {
        return;
      }
      throw error;
    }

    if (!canDeleteTask(membership, task, userId)) {
      throw new Error("You can only delete tasks you created");
    }

    await ctx.db.patch(args.taskId, { deletedAt: Date.now() });
  },
});

export const updateBoardPosition = mutation({
  args: {
    taskId: v.id("tasks"),
    status: taskStatusValidator,
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const { task, membership } = await requireTaskAccess(
      ctx,
      args.taskId,
      userId,
    );

    if (!canEditTask(membership, task, userId)) {
      throw new Error("You don't have permission to move this task");
    }

    await ctx.db.patch(args.taskId, {
      status: args.status,
      order: args.order,
      ...completionPatch(task, args.status),
      updatedAt: Date.now(),
    });
  },
});

export const listAll = query({
  args: {
    organizationId: v.id("organizations"),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    try {
      await requireOrgMembership(ctx, args.organizationId, userId);
    } catch {
      throw new Error("Not a member");
    }

    const taskQuery = args.projectId
      ? ctx.db
          .query("tasks")
          .withIndex("by_projectId", (index) =>
            index.eq("projectId", args.projectId!),
          )
      : ctx.db
          .query("tasks")
          .withIndex("by_org", (index) =>
            index.eq("organizationId", args.organizationId),
          );

    const tasks = await taskQuery
      .filter((filter) => filter.eq(filter.field("deletedAt"), undefined))
      .collect();

    return await Promise.all(
      tasks.map(async (task) => {
        const creator = await ctx.db.get(task.creatorUserId);
        const assignee = task.assigneeUserId
          ? await ctx.db.get(task.assigneeUserId)
          : null;
        const project = await ctx.db.get(task.projectId);

        return {
          ...task,
          creator,
          assignee,
          project,
        };
      }),
    );
  },
});

export const bulkUpdate = mutation({
  args: {
    ids: v.array(v.id("tasks")),
    updates: v.object({
      status: v.optional(taskStatusValidator),
      priority: v.optional(taskPriorityValidator),
      assigneeUserId: v.optional(v.id("users")),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    for (const id of args.ids) {
      const task = await ctx.db.get(id);
      if (!task) continue;

      try {
        const { membership } = await requireTaskAccess(ctx, id, userId);
        if (!canEditTask(membership, task, userId)) {
          continue;
        }
      } catch {
        continue;
      }

      await ctx.db.patch(id, {
        ...args.updates,
        ...completionPatch(task, args.updates.status),
        updatedAt: Date.now(),
      });
    }
  },
});

export const bulkDelete = mutation({
  args: {
    ids: v.array(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    for (const id of args.ids) {
      const task = await ctx.db.get(id);
      if (!task) continue;

      try {
        const { membership } = await requireTaskAccess(ctx, id, userId);
        if (!canDeleteTask(membership, task, userId)) {
          continue;
        }
      } catch {
        continue;
      }

      await ctx.db.patch(id, { deletedAt: Date.now() });
    }
  },
});
