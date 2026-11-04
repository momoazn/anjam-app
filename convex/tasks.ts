import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import {
  assertOrgRefs,
  canDeleteTask,
  canEditTask,
  requireOrgMembership,
  requireProjectAccess,
  requireTaskAccess,
} from "./lib/auth";
import {
  MAX_NAME,
  MAX_TEXT,
  MAX_TITLE,
  assertNonNegative,
  capSearch,
  cleanOptionalText,
  cleanText,
} from "./lib/validation";
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

async function requireProjectInOrg(
  ctx: QueryCtx,
  organizationId: Id<"organizations">,
  projectId: Id<"projects">,
) {
  const project = await ctx.db.get(projectId);
  if (project?.organizationId !== organizationId) {
    throw new Error("Project not found");
  }
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
    await assertOrgRefs(ctx, project.organizationId, {
      userIds: [args.assigneeUserId],
      tagIds: args.tags,
    });
    const title = cleanText(args.title, "Title", MAX_TITLE);
    const description = args.description
      ? cleanOptionalText(args.description, "Description", MAX_TEXT)
      : undefined;
    const taskType = args.taskType
      ? cleanOptionalText(args.taskType, "Task type", MAX_NAME)
      : undefined;
    assertNonNegative(args.deadline, "Deadline");
    assertNonNegative(args.storyPoints, "Story points");

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
      title,
      description,
      priority: args.priority,
      status: args.status,
      deadline: args.deadline,
      order: Date.now(),
      tags: args.tags || [],
      displayId,
      taskNumber,
      taskType,
      storyPoints: args.storyPoints,
      updatedAt: Date.now(),
    });
  },
});

export const get = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.deletedAt !== undefined) return null;

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
    statuses: v.optional(v.array(taskStatusValidator)),
    priority: v.optional(taskPriorityValidator),
    tagId: v.optional(v.id("tags")),
    // Inclusive deadline window (ms). The client computes it from its local calendar.
    deadlineFrom: v.optional(v.number()),
    deadlineTo: v.optional(v.number()),
    // Open (not done/cancelled) tasks whose deadline is before this instant (ms).
    overdueBefore: v.optional(v.number()),
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
    if (args.projectId) {
      await requireProjectInOrg(ctx, args.organizationId, args.projectId);
    }

    const searchTerm = args.searchTerm ? capSearch(args.searchTerm) : undefined;
    const baseQuery = ctx.db.query("tasks");
    let q:
      | ReturnType<typeof baseQuery.withSearchIndex>
      | ReturnType<typeof baseQuery.withIndex>;

    if (searchTerm) {
      q = baseQuery.withSearchIndex("search_title", (index) => {
        let search = index.search("title", searchTerm);
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

    const { statuses, deadlineFrom, deadlineTo, overdueBefore } = args;
    if (statuses && statuses.length > 0) {
      q = q.filter((filter) =>
        filter.or(
          ...statuses.map((status) =>
            filter.eq(filter.field("status"), status),
          ),
        ),
      );
    }

    // A missing deadline sorts below every number, so gte/lte alone exclude it
    // from a window, but lt needs an explicit existence check.
    if (deadlineFrom !== undefined) {
      q = q.filter((filter) =>
        filter.gte(filter.field("deadline"), deadlineFrom),
      );
    }
    if (deadlineTo !== undefined) {
      q = q.filter((filter) =>
        filter.and(
          filter.neq(filter.field("deadline"), undefined),
          filter.lte(filter.field("deadline"), deadlineTo),
        ),
      );
    }
    if (overdueBefore !== undefined) {
      q = q.filter((filter) =>
        filter.and(
          filter.neq(filter.field("deadline"), undefined),
          filter.lt(filter.field("deadline"), overdueBefore),
          filter.neq(filter.field("status"), "done"),
          filter.neq(filter.field("status"), "cancelled"),
        ),
      );
    }

    if (args.priority) {
      q = q.filter((filter) =>
        filter.eq(filter.field("priority"), args.priority),
      );
    }

    if (!searchTerm) {
      q = q.filter((filter) => filter.eq(filter.field("deletedAt"), undefined));
    }

    const page = await q.paginate(args.paginationOpts);

    // ponytail: Convex filters cannot test array membership, so the tag filter
    // runs per page and a page can hold fewer than numItems rows.
    const tagId = args.tagId;
    const tasks = tagId
      ? page.page.filter((task) => task.tags?.includes(tagId))
      : page.page;

    const rows = await Promise.all(
      tasks.map(async (task) => {
        const project = await ctx.db.get(task.projectId);
        if (!project) return null;
        const creator = await ctx.db.get(task.creatorUserId);
        const assignee = task.assigneeUserId
          ? await ctx.db.get(task.assigneeUserId)
          : null;

        return {
          ...task,
          creator,
          assignee,
          project,
        };
      }),
    );

    return {
      ...page,
      page: rows.filter((row) => row !== null),
    };
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    // null clears an optional field; undefined leaves it unchanged.
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.union(v.string(), v.null())),
      status: v.optional(taskStatusValidator),
      priority: v.optional(taskPriorityValidator),
      assigneeUserId: v.optional(v.union(v.id("users"), v.null())),
      deadline: v.optional(v.union(v.number(), v.null())),
      tags: v.optional(v.array(v.id("tags"))),
      taskType: v.optional(v.string()),
      storyPoints: v.optional(v.union(v.number(), v.null())),
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

    const { updates } = args;
    await assertOrgRefs(ctx, task.organizationId, {
      userIds: [updates.assigneeUserId],
      tagIds: updates.tags,
    });
    assertNonNegative(updates.deadline ?? undefined, "Deadline");
    assertNonNegative(updates.storyPoints ?? undefined, "Story points");

    // ctx.db.patch removes a field when its value is undefined.
    const patch: Partial<Doc<"tasks">> = { updatedAt: Date.now() };
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.priority !== undefined) patch.priority = updates.priority;
    if (updates.tags !== undefined) patch.tags = updates.tags;
    if (updates.title !== undefined) {
      patch.title = cleanText(updates.title, "Title", MAX_TITLE);
    }
    if (updates.taskType !== undefined) {
      patch.taskType = cleanOptionalText(
        updates.taskType,
        "Task type",
        MAX_NAME,
      );
    }
    if (updates.description !== undefined) {
      patch.description =
        updates.description === null
          ? undefined
          : cleanOptionalText(updates.description, "Description", MAX_TEXT);
    }
    if (updates.assigneeUserId !== undefined) {
      patch.assigneeUserId = updates.assigneeUserId ?? undefined;
    }
    if (updates.deadline !== undefined) {
      patch.deadline = updates.deadline ?? undefined;
    }
    if (updates.storyPoints !== undefined) {
      patch.storyPoints = updates.storyPoints ?? undefined;
    }

    await ctx.db.patch(args.taskId, patch);
  },
});

export const softDelete = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task || task.deletedAt !== undefined) return;

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
    if (!Number.isFinite(args.order)) {
      throw new Error("Order must be a finite number");
    }

    await ctx.db.patch(args.taskId, {
      status: args.status,
      order: args.order,
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
    if (args.projectId) {
      await requireProjectInOrg(ctx, args.organizationId, args.projectId);
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

    const rows = await Promise.all(
      tasks.map(async (task) => {
        const project = await ctx.db.get(task.projectId);
        if (!project) return null;
        const creator = await ctx.db.get(task.creatorUserId);
        const assignee = task.assigneeUserId
          ? await ctx.db.get(task.assigneeUserId)
          : null;

        return {
          ...task,
          creator,
          assignee,
          project,
        };
      }),
    );
    return rows.filter((row) => row !== null);
  },
});

export const bulkUpdate = mutation({
  args: {
    ids: v.array(v.id("tasks")),
    updates: v.object({
      status: v.optional(taskStatusValidator),
      priority: v.optional(taskPriorityValidator),
      assigneeUserId: v.optional(v.union(v.id("users"), v.null())),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const checkedOrgs = new Set<Id<"organizations">>();
    let updated = 0;

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

      if (!checkedOrgs.has(task.organizationId)) {
        await assertOrgRefs(ctx, task.organizationId, {
          userIds: [args.updates.assigneeUserId],
        });
        checkedOrgs.add(task.organizationId);
      }

      const { assigneeUserId, ...rest } = args.updates;
      await ctx.db.patch(id, {
        ...rest,
        ...(assigneeUserId !== undefined && {
          assigneeUserId: assigneeUserId ?? undefined,
        }),
        updatedAt: Date.now(),
      });
      updated++;
    }
    return updated;
  },
});

export const bulkDelete = mutation({
  args: {
    ids: v.array(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    let deleted = 0;

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
      deleted++;
    }
    return deleted;
  },
});
