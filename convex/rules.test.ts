// @vitest-environment edge-runtime
/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it, vi } from "vitest";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

// Same auth stub as tenancy.test.ts: resolve the user from the test identity.
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

// Org A: ownerA (owner) + memberA. Org B: ownerB. Each org has a project and a tag.
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
      role: "owner" | "member",
    ) =>
      ctx.db.insert("organizationMembers", {
        organizationId,
        userId,
        role,
        status: "active",
        onboardingCompleted: true,
      });
    const ownerA = await user("ownerA");
    const memberA = await user("memberA");
    const ownerB = await user("ownerB");
    const orgA = await org("org-a");
    const orgB = await org("org-b");
    await join(orgA, ownerA, "owner");
    await join(orgA, memberA, "member");
    await join(orgB, ownerB, "owner");
    const projectA = await ctx.db.insert("projects", {
      organizationId: orgA,
      name: "A",
      code: "AAA",
    });
    const projectB = await ctx.db.insert("projects", {
      organizationId: orgB,
      name: "B",
      code: "BBB",
    });
    const tagA = await ctx.db.insert("tags", {
      organizationId: orgA,
      name: "a",
      creatorUserId: ownerA,
    });
    const tagB = await ctx.db.insert("tags", {
      organizationId: orgB,
      name: "b",
      creatorUserId: ownerB,
    });
    return {
      ownerA,
      memberA,
      ownerB,
      orgA,
      orgB,
      projectA,
      projectB,
      tagA,
      tagB,
    };
  });
  return {
    t,
    ids,
    ownerA: t.withIdentity({ subject: "auth-ownerA" }),
    memberA: t.withIdentity({ subject: "auth-memberA" }),
    ownerB: t.withIdentity({ subject: "auth-ownerB" }),
  };
}

const newTask = (projectId: Id<"projects">, title = "task") => ({
  projectId,
  title,
  priority: "medium" as const,
  status: "todo" as const,
});

describe("soft-deleted tasks", () => {
  it("are not readable or editable", async () => {
    const { ownerA, ids } = await setup();
    const taskId = await ownerA.mutation(
      api.tasks.create,
      newTask(ids.projectA),
    );
    await ownerA.mutation(api.tasks.softDelete, { taskId });
    expect(await ownerA.query(api.tasks.get, { taskId })).toBeNull();
    await expect(
      ownerA.mutation(api.tasks.update, { taskId, updates: { title: "x" } }),
    ).rejects.toThrow("Task not found");
  });
});
