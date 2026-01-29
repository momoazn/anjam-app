import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { getAuthUserId } from "./utils";

export const getForOrg = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_org_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member");

    // Compute metrics
    const now = new Date();
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay(),
    ).getTime();

    const [createdThisWeekTasks, completedThisWeekTasks, inProgressTasks, all] =
      await Promise.all([
        ctx.db
          .query("tasks")
          .withIndex("by_org", (q) =>
            q.eq("organizationId", args.organizationId),
          )
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .filter((q) => q.gte(q.field("_creationTime"), startOfWeek))
          .collect(),
        ctx.db
          .query("tasks")
          .withIndex("by_org", (q) =>
            q.eq("organizationId", args.organizationId),
          )
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .filter((q) => q.eq(q.field("status"), "done"))
          .filter((q) => q.gte(q.field("updatedAt"), startOfWeek))
          .collect(),
        ctx.db
          .query("tasks")
          .withIndex("by_org", (q) =>
            q.eq("organizationId", args.organizationId),
          )
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .filter((q) => q.eq(q.field("status"), "in_progress"))
          .collect(),
        ctx.db
          .query("tasks")
          .withIndex("by_org", (q) =>
            q.eq("organizationId", args.organizationId),
          )
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .collect(),
      ]);

    const createdThisWeek = createdThisWeekTasks.length;
    const completedThisWeek = completedThisWeekTasks.length;
    const inProgress = inProgressTasks.length;

    const byAssignee: Record<string, { name: string; count: number }> = {};
    for (const task of all) {
      if (!task.assigneeUserId) continue;
      const assigneeId = task.assigneeUserId;
      byAssignee[assigneeId] ??= { name: "Loading...", count: 0 };
      byAssignee[assigneeId].count++;
    }

    // Fetch user names for assignee workload
    const assigneeIds = Object.keys(byAssignee);
    await Promise.all(
      assigneeIds.map(async (id) => {
        const user = await ctx.db.get(id as Id<"users">);
        if (user) {
          byAssignee[id].name = user.username || user.firstName || "User";
        }
      }),
    );

    return {
      createdThisWeek,
      completedThisWeek,
      inProgress,
      workload: Object.values(byAssignee),
      totalTasks: all.length,
    };
  },
});
