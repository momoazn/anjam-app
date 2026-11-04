// @vitest-environment edge-runtime
/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it, vi } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

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

async function setup() {
  const t = convexTest(schema, modules);
  const ids = await t.run(async (ctx) => {
    const user = await ctx.db.insert("users", {
      authUserId: "auth-u",
      displayName: "u",
    });
    const org = await ctx.db.insert("organizations", {
      name: "o",
      slug: "o",
      active: true,
      plan: "free",
    });
    await ctx.db.insert("organizationMembers", {
      organizationId: org,
      userId: user,
      role: "owner",
      status: "active",
      onboardingCompleted: true,
    });
    const project = await ctx.db.insert("projects", {
      organizationId: org,
      name: "P",
      code: "PPP",
    });
    const tag = await ctx.db.insert("tags", {
      organizationId: org,
      name: "t",
      creatorUserId: user,
    });
    return { org, project, tag };
  });
  return { ids, me: t.withIdentity({ subject: "auth-u" }) };
}

const DAY = 86_400_000;
const first = { numItems: 50, cursor: null };

describe("tasks.list filters and pagination", () => {
  it("filters by several statuses, tag, and deadline", async () => {
    const { ids, me } = await setup();
    const base = { projectId: ids.project, priority: "low" as const };
    const now = Date.now();
    await me.mutation(api.tasks.create, {
      ...base,
      title: "todo-tagged",
      status: "todo",
      tags: [ids.tag],
      deadline: now - 2 * DAY,
    });
    await me.mutation(api.tasks.create, {
      ...base,
      title: "done-old",
      status: "done",
      deadline: now - 2 * DAY,
    });
    await me.mutation(api.tasks.create, {
      ...base,
      title: "review-future",
      status: "in_review",
      deadline: now + 2 * DAY,
    });
    await me.mutation(api.tasks.create, {
      ...base,
      title: "no-deadline",
      status: "todo",
    });

    const titles = async (extra: object) =>
      (
        await me.query(api.tasks.list, {
          organizationId: ids.org,
          paginationOpts: first,
          ...extra,
        })
      ).page
        .map((t) => t.title)
        .sort();

    expect(await titles({ statuses: ["todo", "done"] })).toEqual([
      "done-old",
      "no-deadline",
      "todo-tagged",
    ]);
    expect(await titles({ tagId: ids.tag })).toEqual(["todo-tagged"]);
    expect(await titles({ overdueBefore: now })).toEqual(["todo-tagged"]);
    expect(
      await titles({ deadlineFrom: now, deadlineTo: now + 3 * DAY }),
    ).toEqual(["review-future"]);
  });

  it("advances with the returned cursor", async () => {
    const { ids, me } = await setup();
    for (const n of [1, 2, 3]) {
      await me.mutation(api.tasks.create, {
        projectId: ids.project,
        title: `t${n}`,
        priority: "low",
        status: "todo",
      });
    }
    const p1 = await me.query(api.tasks.list, {
      organizationId: ids.org,
      paginationOpts: { numItems: 2, cursor: null },
    });
    expect(p1.page).toHaveLength(2);
    expect(p1.isDone).toBe(false);
    const p2 = await me.query(api.tasks.list, {
      organizationId: ids.org,
      paginationOpts: { numItems: 2, cursor: p1.continueCursor },
    });
    expect(p2.page).toHaveLength(1);
    expect(p2.page[0]._id).not.toBe(p1.page[0]._id);
  });
});
