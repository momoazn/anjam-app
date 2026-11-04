// @vitest-environment edge-runtime
/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it, vi } from "vitest";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

// Better Auth runs as a Convex component and needs env secrets. Stub only the
// auth client: resolve the auth user from the identity set by `t.withIdentity`.
// Everything else (convex/utils.ts, convex/lib/auth.ts, the functions) is real.
vi.mock("./auth", () => {
  const getAuthUser = async (ctx: {
    auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
  }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    return { _id: identity.subject };
  };
  return {
    authComponent: {
      getAuthUser,
      safeGetAuthUser: (ctx: Parameters<typeof getAuthUser>[0]) =>
        getAuthUser(ctx).catch(() => null),
    },
  };
});

const modules = import.meta.glob("./**/!(*.*.*)*.*s");

type Role = "owner" | "member";

// Two orgs, each with an owner; org A also has a plain member.
async function setup() {
  const t = convexTest(schema, modules);
  const ids = await t.run(async (ctx) => {
    const user = (name: string) =>
      ctx.db.insert("users", { authUserId: `auth-${name}`, displayName: name });
    const org = (slug: string) =>
      ctx.db.insert("organizations", {
        name: slug,
        slug,
        active: true,
        plan: "free",
      });
    const join = (
      organizationId: Id<"organizations">,
      userId: Id<"users">,
      role: Role,
    ) =>
      ctx.db.insert("organizationMembers", {
        organizationId,
        userId,
        role,
        status: "active",
        onboardingCompleted: true,
      });
    const project = (organizationId: Id<"organizations">, code: string) =>
      ctx.db.insert("projects", { organizationId, name: code, code });

    const [ownerA, memberA, ownerB] = await Promise.all([
      user("ownerA"),
      user("memberA"),
      user("ownerB"),
    ]);
    const orgA = await org("org-a");
    const orgB = await org("org-b");
    await join(orgA, ownerA, "owner");
    await join(orgA, memberA, "member");
    await join(orgB, ownerB, "owner");
    const projectA = await project(orgA, "AAA");
    const projectA2 = await project(orgA, "AAB");
    const projectB = await project(orgB, "BBB");
    const taskB = await ctx.db.insert("tasks", {
      projectId: projectB,
      organizationId: orgB,
      creatorUserId: ownerB,
      title: "Secret B task",
      priority: "low",
      status: "todo",
      order: 1,
      tags: [],
      displayId: "BBB-001",
      taskNumber: 1,
      updatedAt: 1,
    });
    const taskA = await ctx.db.insert("tasks", {
      projectId: projectA,
      organizationId: orgA,
      creatorUserId: ownerA,
      title: "A task by owner",
      priority: "low",
      status: "todo",
      order: 1,
      tags: [],
      displayId: "AAA-001",
      taskNumber: 1,
      updatedAt: 1,
    });
    return {
      orgA,
      orgB,
      projectA,
      projectA2,
      projectB,
      taskA,
      taskB,
    };
  });
  return {
    ids,
    ownerA: t.withIdentity({ subject: "auth-ownerA" }),
    memberA: t.withIdentity({ subject: "auth-memberA" }),
    ownerB: t.withIdentity({ subject: "auth-ownerB" }),
    anon: t,
  };
}

const newTask = (projectId: Id<"projects">, title: string) => ({
  projectId,
  title,
  priority: "medium" as const,
  status: "todo" as const,
});

describe("tenant isolation", () => {
  it("rejects unauthenticated callers", async () => {
    const { anon, ids } = await setup();
    await expect(
      anon.query(api.projects.listByOrg, { organizationId: ids.orgA }),
    ).rejects.toThrow();
  });

  it("does not let an org A member list org B projects or tasks", async () => {
    const { ownerA, ids } = await setup();
    await expect(
      ownerA.query(api.projects.listByOrg, { organizationId: ids.orgB }),
    ).rejects.toThrow("Not a member");
    await expect(
      ownerA.query(api.tasks.list, {
        organizationId: ids.orgB,
        paginationOpts: { numItems: 10, cursor: null },
      }),
    ).rejects.toThrow("Not a member");
  });

  it("does not return an org B task by id", async () => {
    const { ownerA, ownerB, ids } = await setup();
    await expect(
      ownerA.query(api.tasks.get, { taskId: ids.taskB }),
    ).rejects.toThrow();
    // Sanity check: the task is readable by its own org.
    const task = await ownerB.query(api.tasks.get, { taskId: ids.taskB });
    expect(task?.title).toBe("Secret B task");
  });

  it("does not let an org A member modify or create in org B", async () => {
    const { ownerA, ownerB, ids } = await setup();
    await expect(
      ownerA.mutation(api.tasks.update, {
        taskId: ids.taskB,
        updates: { title: "hacked" },
      }),
    ).rejects.toThrow("Not a member of this organization");
    await expect(
      ownerA.mutation(api.tasks.create, newTask(ids.projectB, "intruder")),
    ).rejects.toThrow("Not a member of this organization");
    const task = await ownerB.query(api.tasks.get, { taskId: ids.taskB });
    expect(task?.title).toBe("Secret B task");
  });
});

describe("task display IDs", () => {
  it("numbers tasks sequentially per project with the project code", async () => {
    const { ownerA, ids } = await setup();
    // projectA already has a manually inserted task but no counter row.
    const first = await ownerA.mutation(
      api.tasks.create,
      newTask(ids.projectA, "one"),
    );
    const second = await ownerA.mutation(
      api.tasks.create,
      newTask(ids.projectA, "two"),
    );
    const ids1 = await Promise.all(
      [first, second].map((taskId) => ownerA.query(api.tasks.get, { taskId })),
    );
    expect(ids1.map((t) => t?.displayId)).toEqual(["AAA-001", "AAA-002"]);
  });

  it("starts a separate counter for each project", async () => {
    const { ownerA, ids } = await setup();
    await ownerA.mutation(api.tasks.create, newTask(ids.projectA, "a1"));
    const other = await ownerA.mutation(
      api.tasks.create,
      newTask(ids.projectA2, "b1"),
    );
    const task = await ownerA.query(api.tasks.get, { taskId: other });
    expect(task?.displayId).toBe("AAB-001");
    expect(task?.taskNumber).toBe(1);
  });
});

describe("roles", () => {
  it("does not let a member edit or delete a task they did not create", async () => {
    const { memberA, ownerA, ids } = await setup();
    await expect(
      memberA.mutation(api.tasks.update, {
        taskId: ids.taskA,
        updates: { title: "nope" },
      }),
    ).rejects.toThrow("You can only edit tasks");
    await expect(
      memberA.mutation(api.tasks.softDelete, { taskId: ids.taskA }),
    ).rejects.toThrow("You can only delete tasks");
    // The owner may do both.
    await ownerA.mutation(api.tasks.update, {
      taskId: ids.taskA,
      updates: { title: "owner edit" },
    });
    const task = await ownerA.query(api.tasks.get, { taskId: ids.taskA });
    expect(task?.title).toBe("owner edit");
  });
});
