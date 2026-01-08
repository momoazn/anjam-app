import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { getAuthUserId } from "./utils";

export const getForMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    // We can't easily query "tasks where I am assignee OR I was mentioned OR I am creator and it changed recently" in one query.
    // We will do parallel queries.

    // 1. Assigned to me (active tasks only?)
    // "Section A: tasks where assignee == currentUser"
    // Usually we want to exclude done/cancelled?
    // Plan doesn't specify filtering by status for Inbox, but "Inbox" implies active things.
    // However, 6.1 says "Section A: tasks where assignee == currentUser".
    // I'll fetch all assigned to me, maybe limit to 50, sorted by updated?
    // Convex index `by_assignee` is just on assignee.
    // Sorting by updatedAt would require index `by_assignee_updatedAt` or in-memory sort.
    // Given v1 scale, in-memory sort of assigned tasks is likely fine if count is low (<1000).
    // Let's assume we want all assigned tasks.
    const assignedTasks = await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assigneeUserId", userId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // 2. Mentioned
    // "Section B: tasks where current user is mentioned in a comment"
    // We have `mentions` table.
    const mentions = await ctx.db
      .query("mentions")
      .withIndex("by_mentionedUser", (q) => q.eq("mentionedUserId", userId))
      .order("desc") // Newest mentions first
      .take(20);

    // Get unique tasks from mentions
    const mentionedTaskIds = new Set(
      mentions
        .map((m) => m.taskId)
        .filter((id): id is NonNullable<typeof id> => !!id),
    );

    const mentionedTasks = await Promise.all(
      Array.from(mentionedTaskIds).map((id) => ctx.db.get(id)),
    );

    // 3. Recently updated where creator == me
    // Fetch only the most recent tasks created by the user (avoid loading the full history).
    const createdByMeRecent = await ctx.db
      .query("tasks")
      .withIndex("by_creator_updatedAt", (q) => q.eq("creatorUserId", userId))
      .order("desc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(50);

    // Combine assigned + created to find "recently updated"
    // "Section C: tasks updated recently where user is participant"
    // Participant = assigned OR created.
    const allParticipating = [...assignedTasks, ...createdByMeRecent];
    // Dedup by ID
    const uniqueParticipating = Array.from(
      new Map(allParticipating.map((t) => [t._id, t])).values(),
    );

    // Sort by updatedAt desc
    uniqueParticipating.sort(
      (a, b) =>
        (b.updatedAt || b._creationTime) - (a.updatedAt || a._creationTime),
    );
    const recentlyUpdated = uniqueParticipating.slice(0, 20);

    // Enrich tasks with project and creator info
    const enrichTask = async (t: Doc<"tasks"> | null) => {
      if (!t) return null;
      const project = await ctx.db.get(t.projectId);
      const creator = await ctx.db.get(t.creatorUserId);
      const assignee = t.assigneeUserId
        ? await ctx.db.get(t.assigneeUserId)
        : null;
      return { ...t, project, creator, assignee };
    };

    const assignedEnriched = await Promise.all(assignedTasks.map(enrichTask));
    const mentionedEnriched = await Promise.all(mentionedTasks.map(enrichTask));
    const recentEnriched = await Promise.all(recentlyUpdated.map(enrichTask));

    return {
      assigned: assignedEnriched.filter((t) => !!t),
      mentioned: mentionedEnriched.filter((t) => !!t),
      recentlyUpdated: recentEnriched.filter((t) => !!t),
    };
  },
});
