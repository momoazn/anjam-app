import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getAuthUserId } from "../utils";

/**
 * Returns the active membership of a user in an organization, or null.
 * Invited and suspended members count as non-members.
 */
export async function getActiveMembership(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">,
  userId: Id<"users">,
): Promise<Doc<"organizationMembers"> | null> {
  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_org_user", (q) =>
      q.eq("organizationId", organizationId).eq("userId", userId),
    )
    .first();
  return membership?.status === "active" ? membership : null;
}

/**
 * Requires that the current user is an active member of the specified organization.
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
  const membership = await getActiveMembership(
    ctx,
    organizationId,
    actualUserId,
  );

  if (!membership) {
    throw new Error("Not a member of this organization");
  }

  return membership;
}

export async function requireOrgOwnerMembership(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">,
  userId?: Id<"users">,
  errorMessage = "Only owners can perform this action",
): Promise<Doc<"organizationMembers">> {
  const membership = await requireOrgMembership(ctx, organizationId, userId);
  if (membership.role !== "owner") {
    throw new Error(errorMessage);
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
 * Throws an error if not authenticated, task not found (soft-deleted tasks count
 * as not found unless `includeDeleted` is set), or not a member.
 *
 * @returns Object containing the task, project, and membership documents
 */
export async function requireTaskAccess(
  ctx: QueryCtx | MutationCtx,
  taskId: Id<"tasks">,
  userId?: Id<"users">,
  options?: { includeDeleted?: boolean },
): Promise<{
  task: Doc<"tasks">;
  project: Doc<"projects">;
  membership: Doc<"organizationMembers">;
}> {
  const actualUserId = userId || (await getAuthUserId(ctx));

  const task = await ctx.db.get(taskId);
  if (!task || (task.deletedAt !== undefined && !options?.includeDeleted)) {
    throw new Error("Task not found");
  }

  const { project, membership } = await requireProjectAccess(
    ctx,
    task.projectId,
    actualUserId,
  );

  return { task, project, membership };
}

export function canEditTask(
  membership: Doc<"organizationMembers">,
  task: Doc<"tasks">,
  userId: Id<"users">,
) {
  return (
    membership.role === "owner" ||
    task.creatorUserId === userId ||
    task.assigneeUserId === userId
  );
}

export function canDeleteTask(
  membership: Doc<"organizationMembers">,
  task: Doc<"tasks">,
  userId: Id<"users">,
) {
  return membership.role === "owner" || task.creatorUserId === userId;
}

/**
 * Verifies that referenced users are active members of the organization and
 * that referenced tags belong to it. Prevents cross-tenant references.
 */
export async function assertOrgRefs(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">,
  refs: {
    userIds?: Array<Id<"users"> | null | undefined>;
    tagIds?: Id<"tags">[];
  },
) {
  for (const userId of new Set(refs.userIds)) {
    if (!userId) continue;
    if (!(await getActiveMembership(ctx, organizationId, userId))) {
      throw new Error("User is not a member of this organization");
    }
  }
  for (const tagId of new Set(refs.tagIds)) {
    const tag = await ctx.db.get(tagId);
    if (tag?.organizationId !== organizationId) {
      throw new Error("Tag not found in this organization");
    }
  }
}
