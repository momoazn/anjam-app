import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireOrgMembership } from "./lib/auth";
import { MAX_NAME, cleanText } from "./lib/validation";
import { getAuthUserId } from "./utils";

export const listByOrg = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    await requireOrgMembership(ctx, args.organizationId, userId);

    return await ctx.db
      .query("tags")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

export const create = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    await requireOrgMembership(ctx, args.organizationId, userId);
    const name = cleanText(args.name, "Name", MAX_NAME);

    // Check uniqueness
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_org_name", (q) =>
        q.eq("organizationId", args.organizationId).eq("name", name),
      )
      .first();

    if (existing) throw new Error("Tag already exists");

    return await ctx.db.insert("tags", {
      organizationId: args.organizationId,
      name,
      color: args.color,
      creatorUserId: userId,
    });
  },
});

export const update = mutation({
  args: {
    tagId: v.id("tags"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const tag = await ctx.db.get(args.tagId);
    if (!tag) throw new Error("Tag not found");

    await requireOrgMembership(ctx, tag.organizationId, userId);

    const name =
      args.name !== undefined
        ? cleanText(args.name, "Name", MAX_NAME)
        : undefined;

    // Check uniqueness if name changes
    if (name !== undefined && name !== tag.name) {
      const existing = await ctx.db
        .query("tags")
        .withIndex("by_org_name", (q) =>
          q.eq("organizationId", tag.organizationId).eq("name", name),
        )
        .first();

      if (existing) throw new Error("Tag name already taken");
    }

    await ctx.db.patch(args.tagId, {
      ...(name !== undefined && { name }),
      ...(args.color !== undefined && { color: args.color }),
    });
  },
});

export const deleteTag = mutation({
  args: { tagId: v.id("tags") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const tag = await ctx.db.get(args.tagId);
    if (!tag) return;

    await requireOrgMembership(ctx, tag.organizationId, userId);

    // Remove from all tasks?
    // Convex doesn't enforce referential integrity.
    // Ideally we should remove this tag from all tasks in the org.
    // But that might be expensive in a single mutation if many tasks.
    // For now, we just delete the tag. Tasks will have a dangling ID in their tags array.
    // The UI should handle missing tags gracefully (filter them out).

    await ctx.db.delete(args.tagId);
  },
});
