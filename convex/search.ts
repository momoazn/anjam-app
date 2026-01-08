import { v } from "convex/values";

import { query } from "./_generated/server";
import { requireOrgMembership } from "./lib/auth";

export const globalSearch = query({
  args: {
    organizationId: v.id("organizations"),
    q: v.string(),
  },
  handler: async (ctx, args) => {
    await requireOrgMembership(ctx, args.organizationId);

    if (args.q.length < 2) {
      return { tasks: [], projects: [] };
    }

    const projectsByName = await ctx.db
      .query("projects")
      .withSearchIndex("search_name", (q) =>
        q.search("name", args.q).eq("organizationId", args.organizationId),
      )
      .take(10);

    const projectsByCode = await ctx.db
      .query("projects")
      .withSearchIndex("search_code", (q) =>
        q.search("code", args.q).eq("organizationId", args.organizationId),
      )
      .take(10);

    const projectsMap = new Map(
      [...projectsByName, ...projectsByCode].map((project) => [
        project._id,
        project,
      ]),
    );
    const matchedProjects = Array.from(projectsMap.values()).slice(0, 10);

    // Search Tasks using search index
    const tasks = await ctx.db
      .query("tasks")
      .withSearchIndex("search_title", (q) =>
        q
          .search("title", args.q)
          .eq("organizationId", args.organizationId)
          .eq("deletedAt", undefined),
      )
      .take(10);

    return {
      projects: matchedProjects,
      tasks,
    };
  },
});
