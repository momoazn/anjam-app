import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getAuthUserId } from "../utils";

/**
 * Requires that the current user is a member of the specified organization.
 * Throws an error if not authenticated or not a member.
 *
 * @returns The organization membership document
 */
export async function requireOrgMembership(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">,
  userId?: Id<"users">,
): Promise<Doc<"organizationMembers">> {
  const actualUserId = userId || (await getAuthUserId(ctx));

  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_org_user", (q) =>
      q.eq("organizationId", organizationId).eq("userId", actualUserId),
    )
    .first();

  if (!membership) {
    throw new Error("Not a member of this organization");
  }

  return membership;
}

/**
 * Requires that the current user is a member of the organization that owns the project.
 * Throws an error if not authenticated, project not found, or not a member.
 *
 * @returns Object containing the project and membership documents
 */
export async function requireProjectAccess(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  userId?: Id<"users">,
): Promise<{
  project: Doc<"projects">;
  membership: Doc<"organizationMembers">;
}> {
  const actualUserId = userId || (await getAuthUserId(ctx));

  const project = await ctx.db.get(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const membership = await requireOrgMembership(
    ctx,
    project.organizationId,
    actualUserId,
  );

  return { project, membership };
}

/**
 * Requires that the current user is a member of the organization that owns the task.
 * Throws an error if not authenticated, task not found, or not a member.
 *
 * @returns Object containing the task, project, and membership documents
 */
export async function requireTaskAccess(
  ctx: QueryCtx | MutationCtx,
  taskId: Id<"tasks">,
  userId?: Id<"users">,
): Promise<{
  task: Doc<"tasks">;
  project: Doc<"projects">;
  membership: Doc<"organizationMembers">;
}> {
  const actualUserId = userId || (await getAuthUserId(ctx));

  const task = await ctx.db.get(taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  const { project, membership } = await requireProjectAccess(
    ctx,
    task.projectId,
    actualUserId,
  );

  return { task, project, membership };
}
