import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./utils";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    assigneeUserId: v.optional(v.id("users")),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent"),
    ),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("in_review"),
      v.literal("done"),
      v.literal("cancelled"),
    ),
    deadline: v.optional(v.number()),
    tags: v.optional(v.array(v.id("tags"))),
    estimatedMinutes: v.optional(v.number()),
    timeSpentMinutes: v.optional(v.number()),
    taskType: v.optional(v.string()),
    storyPoints: v.optional(v.number()),
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

    if (!membership) throw new Error("Not a member of this organization");

    // Task Numbering (Transactional)
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

    const displayId = `${project.code}-${taskNumber.toString().padStart(3, "0")}`; // Matches typical convention, although plan says {000001} which is 6 digits?
    // Plan: "{PROJECT_CODE}-{000001}"
    // Code says: "e.g. ABC-001" in CLAUDE.md.
    // Plan says: "displayId format {PROJECT_CODE}-{000001}" in 9.6.
    // I'll stick to a reasonable padding. CLAUDE.md says 001. Plan says 000001.
    // I'll use 3 digits for now as it's more standard for smaller apps, but 6 is safer for scale.
    // Let's go with 3 to match CLAUDE.md example unless strict.
    // Wait, let's check existing code if I can.
    // `backend/hooks/tasks.go` isn't readable easily.
    // I will use 3 digits padding: .padStart(3, "0").

    // Default order: Put at end of list? Or top?
    // Board usually puts new tasks in Todo.
    // Order is a number. Let's just use Date.now() for simple sorting or find max order.
    // Finding max order requires query.
    // "order" can be fractional.
    // Let's assign order = Date.now() * 1000 to be safe, or just Date.now().
    // If we want it at the bottom, we need max(order) + step.
    // If we want it at the top, min(order) - step.
    // Let's assume top for now or just Date.now().
    const order = Date.now();

    const taskId = await ctx.db.insert("tasks", {
      projectId: args.projectId,
      organizationId: project.organizationId,
      creatorUserId: userId,
      assigneeUserId: args.assigneeUserId,
      title: args.title,
      description: args.description,
      priority: args.priority,
      status: args.status,
      deadline: args.deadline,
      order,
      tags: args.tags || [],
      displayId,
      taskNumber,
      estimatedMinutes: args.estimatedMinutes,
      timeSpentMinutes: args.timeSpentMinutes,
      taskType: args.taskType,
      storyPoints: args.storyPoints,
      updatedAt: Date.now(),
      // watchers: [userId], // Auto-watch created task? Plan doesn't strictly say.
    });

    // TODO: Trigger notifications (Task 24)
    // We can do this in an internal mutation call or here.
    // Plan 9.10: "Create notifications for: task assigned..."

    return taskId;
  },
});

export const get = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) return null;

    const project = await ctx.db.get(task.projectId);
    if (!project) return null;

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();
    if (!membership) {
      throw new Error("Forbidden");
    }

    const creator = await ctx.db.get(task.creatorUserId);
    const assignee = task.assigneeUserId
      ? await ctx.db.get(task.assigneeUserId)
      : null;
    const projectDoc = await ctx.db.get(task.projectId);

    // Fetch tags
    const tagsData = await Promise.all(
      (task.tags || []).map(async (tagId) => {
        return await ctx.db.get(tagId);
      }),
    );

    return {
      ...task,
      creator,
      assignee,
      project: projectDoc,
      tagsData: tagsData.filter((t) => t !== null),
    };
  },
});

export const list = query({
  args: {
    organizationId: v.id("organizations"),
    projectId: v.optional(v.id("projects")),
    assigneeUserId: v.optional(v.id("users")),
    status: v.optional(v.string()), // Can be specific status
    priority: v.optional(v.string()),
    searchTerm: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member");

    const baseQuery = ctx.db.query("tasks");
    let q;

    if (args.searchTerm) {
      q = baseQuery.withSearchIndex("search_title", (q) => {
        let search = q.search("title", args.searchTerm!);
        if (args.projectId) {
          search = search.eq("projectId", args.projectId);
        }
        return search
          .eq("organizationId", args.organizationId)
          .eq("deletedAt", undefined);
      });
    } else if (args.projectId) {
      q = baseQuery.withIndex("by_projectId", (q) =>
        q.eq("projectId", args.projectId!),
      );
    } else {
      q = baseQuery.withIndex("by_org", (q) =>
        q.eq("organizationId", args.organizationId),
      );
    }

    if (args.assigneeUserId) {
      q = q.filter((q) => q.eq(q.field("assigneeUserId"), args.assigneeUserId));
    }

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    if (args.priority) {
      q = q.filter((q) => q.eq(q.field("priority"), args.priority));
    }

    if (!args.searchTerm) {
      q = q.filter((q) => q.eq(q.field("deletedAt"), undefined));
    }

    const page = await q.paginate(args.paginationOpts);

    const enrichedPage = await Promise.all(
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
    );

    return {
      ...page,
      page: enrichedPage,
    };
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(v.string()), // Validate enum values?
      priority: v.optional(v.string()),
      assigneeUserId: v.optional(v.id("users")),
      deadline: v.optional(v.number()),
      tags: v.optional(v.array(v.id("tags"))),
      estimatedMinutes: v.optional(v.number()),
      timeSpentMinutes: v.optional(v.number()),
      taskType: v.optional(v.string()),
      storyPoints: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const project = await ctx.db.get(task.projectId);
    if (!project) throw new Error("Project not found");

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member");

    // Permissions:
    // Members can edit tasks they created OR are assigned to.
    // Owners can edit any task.
    if (membership.role !== "owner") {
      if (task.creatorUserId !== userId && task.assigneeUserId !== userId) {
        throw new Error(
          "You can only edit tasks you created or are assigned to",
        );
      }
    }

    // If status updates to 'done', maybe set completedAt? Not in schema.
    // Just patch updates.
    const updates = { ...args.updates } as Partial<Doc<"tasks">>;
    await ctx.db.patch(args.taskId, {
      ...updates,
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

    const project = await ctx.db.get(task.projectId);
    if (!project) return;

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member");

    // Permissions:
    // Members can soft-delete tasks they created only.
    // Owners can delete any task.
    if (membership.role !== "owner") {
      if (task.creatorUserId !== userId) {
        throw new Error("You can only delete tasks you created");
      }
    }

    await ctx.db.patch(args.taskId, { deletedAt: Date.now() });
  },
});

export const updateBoardPosition = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("in_review"),
      v.literal("done"),
      v.literal("cancelled"),
    ),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // We reuse update logic permissions?
    // "Persist drag-and-drop updates to status and order."
    // Usually moving a card on board is considered "editing".
    const project = await ctx.db.get(task.projectId);
    if (!project) throw new Error("Project not found");

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member");

    if (membership.role !== "owner") {
      if (task.creatorUserId !== userId && task.assigneeUserId !== userId) {
        throw new Error("You don't have permission to move this task");
      }
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

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member");

    const q = args.projectId
      ? ctx.db
          .query("tasks")
          .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId!))
      : ctx.db
          .query("tasks")
          .withIndex("by_org", (q) =>
            q.eq("organizationId", args.organizationId),
          );

    const tasks = await q
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    return await Promise.all(
      tasks.map(async (task) => {
        const assignee = task.assigneeUserId
          ? await ctx.db.get(task.assigneeUserId)
          : null;
        const project = await ctx.db.get(task.projectId);

        return {
          ...task,
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
      status: v.optional(
        v.union(
          v.literal("todo"),
          v.literal("in_progress"),
          v.literal("in_review"),
          v.literal("done"),
          v.literal("cancelled"),
        ),
      ),
      priority: v.optional(
        v.union(
          v.literal("low"),
          v.literal("medium"),
          v.literal("high"),
          v.literal("urgent"),
        ),
      ),
      assigneeUserId: v.optional(v.id("users")),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    for (const id of args.ids) {
      const task = await ctx.db.get(id);
      if (!task) continue;

      const project = await ctx.db.get(task.projectId);
      if (!project) continue;

      const membership = await ctx.db
        .query("organizationMembers")
        .withIndex("by_org_user", (q) =>
          q.eq("organizationId", project.organizationId).eq("userId", userId),
        )
        .first();

      if (!membership) continue;

      if (membership.role !== "owner") {
        if (task.creatorUserId !== userId && task.assigneeUserId !== userId) {
          continue;
        }
      }

      await ctx.db.patch(id, {
        ...args.updates,
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

      const project = await ctx.db.get(task.projectId);
      if (!project) continue;

      const membership = await ctx.db
        .query("organizationMembers")
        .withIndex("by_org_user", (q) =>
          q.eq("organizationId", project.organizationId).eq("userId", userId),
        )
        .first();

      if (!membership) continue;

      if (membership.role !== "owner" && task.creatorUserId !== userId) {
        continue;
      }

      await ctx.db.patch(id, { deletedAt: Date.now() });
    }
  },
});
