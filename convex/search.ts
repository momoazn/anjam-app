import { v } from "convex/values";

import { query } from "./_generated/server";
import { getAuthUserId } from "./utils";

export const globalSearch = query({
  args: {
    organizationId: v.id("organizations"),
    q: v.string(),
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

    if (args.q.length < 2) {
      return { tasks: [], projects: [] };
    }

    const queryLower = args.q.toLowerCase();

    // Search Projects
    // We iterate projects in org.
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const matchedProjects = projects
      .filter(
        (p) =>
          p.name.toLowerCase().includes(queryLower) ||
          p.code.toLowerCase().includes(queryLower),
      )
      .slice(0, 10);

    // Search Tasks
    // We iterate tasks in org.
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    const matchedTasks = tasks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(queryLower) ||
          t.displayId.toLowerCase().includes(queryLower),
      )
      .slice(0, 10);

    return {
      projects: matchedProjects,
      tasks: matchedTasks,
    };
  },
});
