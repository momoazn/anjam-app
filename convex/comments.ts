import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./utils";

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) return []; // Or throw

    const project = await ctx.db.get(task.projectId);
    if (!project) return [];

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member");

    // List comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Enrich with author info
    const enriched = await Promise.all(
      comments.map(async (c) => {
        const user = await ctx.db.get(c.userId);
        return {
          ...c,
          user,
        };
      }),
    );

    return enriched;
  },
});

export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    content: v.string(),
    parentCommentId: v.optional(v.id("comments")),
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

    const commentId = await ctx.db.insert("comments", {
      taskId: args.taskId,
      userId,
      content: args.content,
      parentCommentId: args.parentCommentId,
    });

    // Parse mentions: @username (allow dots/hyphens for email prefixes)
    const mentionRegex = /@([\w.-]+)/g;
    const matches = args.content.matchAll(mentionRegex);
    const mentionedUsernames = new Set<string>();
    for (const match of matches) {
      mentionedUsernames.add(match[1].toLowerCase());
    }

    if (mentionedUsernames.size > 0) {
      // Query organization members and join with user data for efficient mention matching
      // This is much more efficient than querying all users
      const orgMembers = await ctx.db
        .query("organizationMembers")
        .withIndex("by_org", (q) =>
          q.eq("organizationId", project.organizationId),
        )
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      // Get all member user data in parallel
      const memberUsers = await Promise.all(
        orgMembers.map(async (member) => {
          const user = await ctx.db.get(member.userId);
          return user ? { user, membership: member } : null;
        }),
      );

      // Filter out nulls and create a lookup
      const validMembers = memberUsers.filter(
        (item): item is NonNullable<typeof item> => item !== null,
      );

      const memberByEmailPrefix = new Map<
        string,
        (typeof validMembers)[number]
      >();
      const duplicatePrefixes = new Set<string>();
      for (const member of validMembers) {
        const emailPrefix = member.user.email?.split("@")[0]?.toLowerCase();
        if (!emailPrefix) continue;
        if (memberByEmailPrefix.has(emailPrefix)) {
          duplicatePrefixes.add(emailPrefix);
          continue;
        }
        memberByEmailPrefix.set(emailPrefix, member);
      }

      for (const username of mentionedUsernames) {
        // Match by email prefix (before @) - most reliable identifier
        // Skip ambiguous prefixes to avoid notifying the wrong user.
        if (duplicatePrefixes.has(username)) continue;
        const match = memberByEmailPrefix.get(username);

        if (match) {
          const { user, membership: isMember } = match;
          if (isMember) {
            await ctx.db.insert("mentions", {
              mentionedUserId: user._id,
              commentId,
              taskId: args.taskId,
              projectId: task.projectId,
              createdAt: Date.now(),
            });

            const currentUser = await ctx.db.get(userId);
            await ctx.db.insert("notifications", {
              userId: user._id,
              type: "comment", // or system? "comment added"
              title: "You were mentioned",
              message: `${currentUser?.displayName || currentUser?.email || "Someone"} mentioned you in a comment`,
              data: {
                taskId: args.taskId,
                commentId,
                projectId: task.projectId,
              },
              read: false,
              createdAt: Date.now(),
            });
          }
        }
      }
    }

    // Notify assignee if not the commenter
    if (task.assigneeUserId && task.assigneeUserId !== userId) {
      const currentUser = await ctx.db.get(userId);
      await ctx.db.insert("notifications", {
        userId: task.assigneeUserId,
        type: "comment",
        title: "New comment on task",
        message: `${currentUser?.displayName || currentUser?.email || "Someone"} commented on ${task.displayId}`,
        data: { taskId: args.taskId, commentId, projectId: task.projectId },
        read: false,
        createdAt: Date.now(),
      });
    }

    return commentId;
  },
});

export const softDelete = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const comment = await ctx.db.get(args.commentId);
    if (!comment) return;

    if (comment.userId !== userId) {
      const task = await ctx.db.get(comment.taskId);
      if (task) {
        const project = await ctx.db.get(task.projectId);
        if (project) {
          const membership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_org_user", (q) =>
              q
                .eq("organizationId", project.organizationId)
                .eq("userId", userId),
            )
            .first();
          if (!membership || membership.role !== "owner") {
            throw new Error("You can only delete your own comments");
          }
        }
      } else {
        throw new Error("You can only delete your own comments");
      }
    }

    await ctx.db.patch(args.commentId, { deletedAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    commentId: v.id("comments"),
    updates: v.object({
      content: v.optional(v.string()),
      reactions: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    const task = await ctx.db.get(comment.taskId);
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

    const updates: Record<string, unknown> = {};

    if (args.updates.content !== undefined) {
      if (comment.userId !== userId && membership.role !== "owner") {
        throw new Error("You can only edit your own comments");
      }
      updates.content = args.updates.content;
      updates.updatedAt = Date.now();
    }

    if (args.updates.reactions !== undefined) {
      updates.reactions = args.updates.reactions;
      updates.updatedAt = Date.now();
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.commentId, updates);
    }

    return args.commentId;
  },
});
