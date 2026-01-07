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

    // Fetch all tasks for the org
    // Using `by_org` index which we added
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    // Compute metrics
    const now = new Date();
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay(),
    ).getTime();

    let createdThisWeek = 0;
    let completedThisWeek = 0;
    let inProgress = 0;
    let totalTimeSpent = 0;
    let completedWithTime = 0;

    const byAssignee: Record<string, { name: string; count: number }> = {};

    for (const task of tasks) {
      if (task.deletedAt) continue;

      if (task._creationTime >= startOfWeek) {
        createdThisWeek++;
      }

      if (task.status === "done") {
        // We don't have completedAt in schema, relying on updatedAt or _creationTime?
        // If status is done, updatedAt is roughly when it was done if not updated since.
        // This is an approximation.
        // For "completed this week", we check updatedAt.
        if (task.updatedAt && task.updatedAt >= startOfWeek) {
          completedThisWeek++;
        }

        // Cycle time approximation: updatedAt - _creationTime
        if (task.updatedAt) {
          totalTimeSpent += task.updatedAt - task._creationTime;
          completedWithTime++;
        }
      }

      if (task.status === "in_progress") {
        inProgress++;
      }

      if (task.assigneeUserId) {
        // We need assignee names.
        // We can fetch them later or here.
        // For now just count by ID.
        const aid = task.assigneeUserId;
        if (!byAssignee[aid]) {
          byAssignee[aid] = { name: "Loading...", count: 0 };
        }
        byAssignee[aid].count++;
      }
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

    const cycleTime =
      completedWithTime > 0 ? totalTimeSpent / completedWithTime : 0;
    // on-time rate needs deadline.
    // ...

    return {
      createdThisWeek,
      completedThisWeek,
      inProgress,
      cycleTime, // in ms
      workload: Object.values(byAssignee),
      totalTasks: tasks.length,
    };
  },
});
