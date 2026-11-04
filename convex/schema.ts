import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    authUserId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    image: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_authUserId", ["authUserId"])
    .index("by_email", ["email"]),

  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    settings: v.optional(v.any()), // JSON
    active: v.boolean(),
    plan: v.string(),
  }).index("by_slug", ["slug"]),

  organizationMembers: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("member")),
    status: v.union(
      v.literal("invited"),
      v.literal("active"),
      v.literal("suspended"),
    ),
    invitedByUserId: v.optional(v.id("users")),
    invitedAt: v.optional(v.number()),
    joinedAt: v.optional(v.number()),
    onboardingCompleted: v.boolean(),
  })
    .index("by_org_user", ["organizationId", "userId"])
    .index("by_user", ["userId"])
    .index("by_org", ["organizationId"]),

  projects: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    supervisorUserId: v.optional(v.id("users")), // Informational only
    updatedAt: v.optional(v.number()),
  })
    .index("by_org", ["organizationId"])
    .index("by_code", ["code"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["organizationId"],
    })
    .searchIndex("search_code", {
      searchField: "code",
      filterFields: ["organizationId"],
    }),

  // Counter table for sequential task numbers per project
  projectCounters: defineTable({
    projectId: v.id("projects"),
    nextTaskNumber: v.number(),
  }).index("by_projectId", ["projectId"]),

  tasks: defineTable({
    projectId: v.id("projects"),
    organizationId: v.id("organizations"), // Denormalized for efficient org-level queries
    creatorUserId: v.id("users"),
    assigneeUserId: v.optional(v.id("users")),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent"),
    ),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("in_review"),
      v.literal("done"),
      v.literal("cancelled"),
    ),
    deadline: v.optional(v.number()),
    order: v.number(), // for board ordering
    tags: v.array(v.id("tags")),
    displayId: v.string(), // {PROJECT_CODE}-{000001}
    taskNumber: v.number(),
    taskType: v.optional(v.string()),
    storyPoints: v.optional(v.number()),
    estimatedMinutes: v.optional(v.number()),
    watchers: v.optional(v.array(v.id("users"))),
    deletedAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_projectId", ["projectId"])
    .index("by_org", ["organizationId"])
    .index("by_project_taskNumber", ["projectId", "taskNumber"])
    .index("by_assignee", ["assigneeUserId"])
    .index("by_creator", ["creatorUserId"])
    .index("by_creator_updatedAt", ["creatorUserId", "updatedAt"])
    .index("by_status", ["status"])
    .index("by_deletedAt", ["deletedAt"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: [
        "organizationId",
        "projectId",
        "status",
        "priority",
        "assigneeUserId",
        "deletedAt",
      ],
    }),

  tags: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    color: v.optional(v.string()),
    creatorUserId: v.id("users"),
  })
    .index("by_org", ["organizationId"])
    .index("by_org_name", ["organizationId", "name"]),

  comments: defineTable({
    taskId: v.id("tasks"),
    userId: v.id("users"),
    content: v.string(),
    parentCommentId: v.optional(v.id("comments")),
    reactions: v.optional(v.any()), // JSON
    deletedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_taskId", ["taskId"])
    .index("by_deletedAt", ["deletedAt"]),

  mentions: defineTable({
    mentionedUserId: v.id("users"),
    commentId: v.optional(v.id("comments")),
    taskId: v.optional(v.id("tasks")),
    projectId: v.optional(v.id("projects")),
    createdAt: v.number(),
  })
    .index("by_mentionedUser", ["mentionedUserId"])
    .index("by_comment", ["commentId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("task_assigned"),
      v.literal("project_updated"),
      v.literal("system"),
      v.literal("comment"),
    ),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()), // JSON
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"]),

  invites: defineTable({
    token: v.string(),
    organizationId: v.id("organizations"),
    role: v.literal("member"), // Fixed to member in v1
    maxUses: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    uses: v.number(),
    inviterId: v.id("users"),
  }).index("by_token", ["token"]),

  subtasks: defineTable({
    taskId: v.id("tasks"),
    title: v.string(),
    assigneeUserId: v.optional(v.id("users")),
    isDone: v.boolean(),
    order: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_taskId", ["taskId"])
    .index("by_assignee", ["assigneeUserId"]),
});
