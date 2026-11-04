import type { GenericCtx } from "@convex-dev/better-auth";
import type { FunctionReference } from "convex/server";
import { v } from "convex/values";

import { components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { DataModel } from "./_generated/dataModel";
import { internalAction, internalMutation } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

const TEST_USERS = [
  {
    email: "admin@example.com",
    password: "admin12345",
    displayName: "Admin User",
  },
  {
    email: "manager@example.com",
    password: "manager123",
    displayName: "Manager User",
  },
  {
    email: "supervisor@example.com",
    password: "supervisor123",
    displayName: "Supervisor User",
  },
  {
    email: "employee1@example.com",
    password: "employee123",
    displayName: "Employee 1",
  },
  {
    email: "employee2@example.com",
    password: "employee123",
    displayName: "Employee 2",
  },
] as const;

const ORG_1 = {
  name: "org1",
  slug: "org1",
  description: "E2E Org 1",
};

const ORG_2 = {
  name: "org2",
  slug: "org2",
  description: "E2E Org 2",
};

const PROJECT = {
  name: "E2E Test Project",
  code: "ETP",
  description: "Project for E2E testing",
};

const TAG = {
  name: "e2e-test",
  color: "#FF6B6B",
};

const TASKS = [
  {
    title: "Test Task 1 Updated",
    description: "Seeded task for E2E comments",
    status: "todo",
    priority: "high",
  },
  {
    title: "QA Task 2",
    description: "Seeded QA task",
    status: "in_progress",
    priority: "medium",
  },
  {
    title: "QA Task 3",
    description: "Seeded QA task",
    status: "done",
    priority: "low",
  },
] as const;

export const writeDevData = internalMutation({
  args: {
    authUsers: v.array(
      v.object({
        email: v.string(),
        authUserId: v.string(),
        displayName: v.string(),
      }),
    ),
    reset: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const createdUsers: Array<{ email: string; userId: Id<"users"> }> = [];
    for (const authUser of args.authUsers) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_authUserId", (q) =>
          q.eq("authUserId", authUser.authUserId),
        )
        .first();

      if (existing) {
        if (!existing.displayName) {
          await ctx.db.patch(existing._id, {
            displayName: authUser.displayName,
            updatedAt: Date.now(),
          });
        }
        createdUsers.push({ email: authUser.email, userId: existing._id });
        continue;
      }

      const userId = await ctx.db.insert("users", {
        authUserId: authUser.authUserId,
        email: authUser.email,
        displayName: authUser.displayName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      createdUsers.push({ email: authUser.email, userId });
    }

    const emailToId = new Map<string, Id<"users">>(
      createdUsers.map((u) => [u.email, u.userId]),
    );
    const getUserId = (email: string) => {
      const userId = emailToId.get(email.toLowerCase());
      if (!userId) {
        throw new Error(`Missing seeded user for ${email}`);
      }
      return userId;
    };

    if (args.reset) {
      const orgs = [
        await ctx.db
          .query("organizations")
          .withIndex("by_slug", (q) => q.eq("slug", ORG_1.slug))
          .first(),
        await ctx.db
          .query("organizations")
          .withIndex("by_slug", (q) => q.eq("slug", ORG_2.slug))
          .first(),
      ].filter((org): org is NonNullable<typeof org> => org !== null);
      for (const org of orgs) {
        const members = await ctx.db
          .query("organizationMembers")
          .withIndex("by_org", (q) => q.eq("organizationId", org._id))
          .collect();
        for (const member of members) {
          await ctx.db.delete(member._id);
        }
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_org", (q) => q.eq("organizationId", org._id))
          .collect();
        for (const project of projects) {
          const tasks = await ctx.db
            .query("tasks")
            .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
            .collect();
          for (const task of tasks) {
            await ctx.db.delete(task._id);
          }
          await ctx.db.delete(project._id);
        }
        const tags = await ctx.db
          .query("tags")
          .withIndex("by_org", (q) => q.eq("organizationId", org._id))
          .collect();
        for (const tag of tags) {
          await ctx.db.delete(tag._id);
        }
        await ctx.db.delete(org._id);
      }
    }

    const upsertOrg = async (orgData: typeof ORG_1) => {
      const existing = await ctx.db
        .query("organizations")
        .withIndex("by_slug", (q) => q.eq("slug", orgData.slug))
        .first();
      if (existing) {
        return existing._id;
      }
      return await ctx.db.insert("organizations", {
        name: orgData.name,
        slug: orgData.slug,
        description: orgData.description,
        active: true,
        plan: "free",
        settings: {},
      });
    };

    const ensureMember = async (
      organizationId: Id<"organizations">,
      userId: Id<"users">,
      role: "owner" | "member",
    ) => {
      const existing = await ctx.db
        .query("organizationMembers")
        .withIndex("by_org_user", (q) =>
          q.eq("organizationId", organizationId).eq("userId", userId),
        )
        .first();
      if (existing) {
        if (existing.role !== role || existing.status !== "active") {
          await ctx.db.patch(existing._id, {
            role,
            status: "active",
            onboardingCompleted: true,
          });
        }
        return existing._id;
      }
      return await ctx.db.insert("organizationMembers", {
        organizationId,
        userId,
        role,
        status: "active",
        onboardingCompleted: true,
        joinedAt: Date.now(),
      });
    };

    const org1Id = await upsertOrg(ORG_1);
    const org2Id = await upsertOrg(ORG_2);

    await ensureMember(org1Id, getUserId("admin@example.com"), "owner");
    await ensureMember(org1Id, getUserId("manager@example.com"), "member");
    await ensureMember(org1Id, getUserId("employee1@example.com"), "member");
    await ensureMember(org1Id, getUserId("employee2@example.com"), "member");
    await ensureMember(org2Id, getUserId("supervisor@example.com"), "owner");

    const existingProject = await ctx.db
      .query("projects")
      .withIndex("by_code", (q) => q.eq("code", PROJECT.code))
      .first();
    const projectId: Id<"projects"> =
      existingProject && existingProject.organizationId === org1Id
        ? existingProject._id
        : await ctx.db.insert("projects", {
            organizationId: org1Id,
            name: PROJECT.name,
            code: PROJECT.code,
            description: PROJECT.description,
            supervisorUserId: getUserId("manager@example.com"),
            updatedAt: Date.now(),
          });

    const existingTag = await ctx.db
      .query("tags")
      .withIndex("by_org_name", (q) =>
        q.eq("organizationId", org1Id).eq("name", TAG.name),
      )
      .first();
    const tagId: Id<"tags"> =
      existingTag?._id ??
      (await ctx.db.insert("tags", {
        organizationId: org1Id,
        name: TAG.name,
        color: TAG.color,
        creatorUserId: getUserId("admin@example.com"),
      }));

    const counter = await ctx.db
      .query("projectCounters")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .first();
    let nextTaskNumber = counter?.nextTaskNumber ?? 1;

    for (const task of TASKS) {
      const existingTask = await ctx.db
        .query("tasks")
        .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
        .filter((q) => q.eq(q.field("title"), task.title))
        .first();
      if (existingTask) continue;

      const taskNumber = nextTaskNumber;
      nextTaskNumber += 1;
      await ctx.db.insert("tasks", {
        projectId,
        organizationId: org1Id,
        creatorUserId: getUserId("admin@example.com"),
        assigneeUserId: getUserId("manager@example.com"),
        title: task.title,
        description: task.description,
        priority: task.priority as "low" | "medium" | "high" | "urgent",
        status: task.status as
          | "todo"
          | "in_progress"
          | "in_review"
          | "done"
          | "cancelled",
        order: Date.now(),
        tags: [tagId],
        displayId: `${PROJECT.code}-${taskNumber.toString().padStart(3, "0")}`,
        taskNumber,
        updatedAt: Date.now(),
      });
    }

    if (counter) {
      await ctx.db.patch(counter._id, { nextTaskNumber });
    } else {
      await ctx.db.insert("projectCounters", {
        projectId,
        nextTaskNumber,
      });
    }

    return {
      org1Id,
      org2Id,
      projectId,
      tagId,
    };
  },
});

export const seedDevData = internalAction({
  args: {
    reset: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const authUsers: Array<{
      email: string;
      authUserId: string;
      displayName: string;
    }> = [];
    const { auth, headers } = await authComponent.getAuth(
      createAuth,
      ctx as unknown as GenericCtx<DataModel>,
    );

    for (const user of TEST_USERS) {
      const email = user.email.toLowerCase();
      const existingAuthUser = await ctx.runQuery(
        components.betterAuth.adapter.findOne,
        {
          model: "user",
          where: [{ field: "email", value: email }],
        },
      );
      const authUser =
        existingAuthUser ??
        (
          await auth.api.signUpEmail({
            body: {
              name: user.displayName,
              email,
              password: user.password,
            },
            headers,
          })
        ).user;
      const authUserId =
        "id" in authUser && authUser.id ? authUser.id : authUser._id;
      authUsers.push({
        email,
        authUserId,
        displayName: user.displayName,
      });
    }

    const writeDevDataRef = "seed:writeDevData" as unknown as FunctionReference<
      "mutation",
      "internal"
    >;
    return await ctx.runMutation(writeDevDataRef, {
      authUsers,
      reset: args.reset ?? false,
    });
  },
});
