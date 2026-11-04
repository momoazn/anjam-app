import { query } from "./_generated/server";
import { getActiveMembership } from "./lib/auth";
import { getAuthUserIdIfExists } from "./utils";

export const listForMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserIdIfExists(ctx);
    if (!userId) return [];

    const mentions = await ctx.db
      .query("mentions")
      .withIndex("by_mentionedUser", (q) => q.eq("mentionedUserId", userId))
      .order("desc") // Newest first
      .take(50); // Limit?

    // Enrich; drop rows whose task is gone or whose org the user left.
    const rows = await Promise.all(
      mentions.map(async (m) => {
        const task = m.taskId ? await ctx.db.get(m.taskId) : null;
        if (!task || task.deletedAt !== undefined) return null;
        if (!(await getActiveMembership(ctx, task.organizationId, userId))) {
          return null;
        }
        const comment = m.commentId ? await ctx.db.get(m.commentId) : null;
        const project = m.projectId ? await ctx.db.get(m.projectId) : null;
        const author = comment ? await ctx.db.get(comment.userId) : null;

        return {
          ...m,
          comment,
          task,
          project,
          author,
        };
      }),
    );
    return rows.filter((row) => row !== null);
  },
});
