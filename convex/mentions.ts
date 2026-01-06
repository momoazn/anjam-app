import { query } from "./_generated/server";
import { getAuthUserId } from "./utils";

export const listForMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    const mentions = await ctx.db
      .query("mentions")
      .withIndex("by_mentionedUser", (q) => q.eq("mentionedUserId", userId))
      .order("desc") // Newest first
      .take(50); // Limit?

    // Enrich
    return await Promise.all(
        mentions.map(async (m) => {
            const comment = m.commentId ? await ctx.db.get(m.commentId) : null;
            const task = m.taskId ? await ctx.db.get(m.taskId) : null;
            const project = m.projectId ? await ctx.db.get(m.projectId) : null;
            const author = comment ? await ctx.db.get(comment.userId) : null;

            return {
                ...m,
                comment,
                task,
                project,
                author
            };
        })
    );
  },
});
