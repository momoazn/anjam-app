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

const page = { numItems: 50, cursor: null };

describe("tenant isolation", () => {
  it("tasks.list and listAll reject a project from another org", async () => {
    const { ownerA, ids } = await setup();
    await expect(
      ownerA.query(api.tasks.list, {
        organizationId: ids.orgA,
        projectId: ids.projectB,
        paginationOpts: page,
      }),
    ).rejects.toThrow("Project not found");
    await expect(
      ownerA.query(api.tasks.listAll, {
        organizationId: ids.orgA,
        projectId: ids.projectB,
      }),
    ).rejects.toThrow("Project not found");
  });

  it("rejects tags and assignees from another org", async () => {
    const { ownerA, ids } = await setup();
    await expect(
      ownerA.mutation(api.tasks.create, {
        ...newTask(ids.projectA),
        tags: [ids.tagB],
      }),
    ).rejects.toThrow("Tag not found");
    await expect(
      ownerA.mutation(api.tasks.create, {
        ...newTask(ids.projectA),
        assigneeUserId: ids.ownerB,
      }),
    ).rejects.toThrow("not a member");
    const taskId = await ownerA.mutation(
      api.tasks.create,
      newTask(ids.projectA),
    );
    await expect(
      ownerA.mutation(api.tasks.update, {
        taskId,
        updates: { tags: [ids.tagB] },
      }),
    ).rejects.toThrow("Tag not found");
  });

  it("rejects a parent comment from another task", async () => {
    const { ownerA, ids } = await setup();
    const t1 = await ownerA.mutation(api.tasks.create, newTask(ids.projectA));
    const t2 = await ownerA.mutation(api.tasks.create, newTask(ids.projectA));
    const parent = await ownerA.mutation(api.comments.create, {
      taskId: t1,
      content: "hi",
    });
    await expect(
      ownerA.mutation(api.comments.create, {
        taskId: t2,
        content: "reply",
        parentCommentId: parent,
      }),
    ).rejects.toThrow("Parent comment");
  });
});

describe("deleteProject", () => {
  it("removes tasks, comments, subtasks and counters", async () => {
    const { t, ownerA, ids } = await setup();
    const taskId = await ownerA.mutation(
      api.tasks.create,
      newTask(ids.projectA),
    );
    await ownerA.mutation(api.comments.create, { taskId, content: "c" });
    await ownerA.mutation(api.subtasks.create, {
      taskId,
      title: "s",
      order: 1,
    });
    await ownerA.mutation(api.projects.deleteProject, {
      projectId: ids.projectA,
    });
    const left = await t.run(async (ctx) => ({
      tasks: (await ctx.db.query("tasks").collect()).length,
      comments: (await ctx.db.query("comments").collect()).length,
      subtasks: (await ctx.db.query("subtasks").collect()).length,
      counters: (await ctx.db.query("projectCounters").collect()).length,
    }));
    expect(left).toEqual({ tasks: 0, comments: 0, subtasks: 0, counters: 0 });
  });
});

describe("orgMembers.remove", () => {
  it("blocks removing the last owner, including self", async () => {
    const { ownerA, ids } = await setup();
    await expect(
      ownerA.mutation(api.orgMembers.remove, {
        organizationId: ids.orgA,
        userId: ids.ownerA,
      }),
    ).rejects.toThrow("last organization owner");
  });

  it("lets a member remove only themselves", async () => {
    const { memberA, ids } = await setup();
    await expect(
      memberA.mutation(api.orgMembers.remove, {
        organizationId: ids.orgA,
        userId: ids.ownerA,
      }),
    ).rejects.toThrow("Only owners");
    await memberA.mutation(api.orgMembers.remove, {
      organizationId: ids.orgA,
      userId: ids.memberA,
    });
  });

  it("unassigns open tasks of the removed user", async () => {
    const { ownerA, ids } = await setup();
    const taskId = await ownerA.mutation(api.tasks.create, {
      ...newTask(ids.projectA),
      assigneeUserId: ids.memberA,
    });
    await ownerA.mutation(api.orgMembers.remove, {
      organizationId: ids.orgA,
      userId: ids.memberA,
    });
    const task = await ownerA.query(api.tasks.get, { taskId });
    expect(task?.assigneeUserId).toBeUndefined();
  });
});

describe("comments", () => {
  it("toggles allow-listed reactions only", async () => {
    const { ownerA, ids, t } = await setup();
    const taskId = await ownerA.mutation(
      api.tasks.create,
      newTask(ids.projectA),
    );
    const commentId = await ownerA.mutation(api.comments.create, {
      taskId,
      content: "hi",
    });
    await ownerA.mutation(api.comments.toggleReaction, {
      commentId,
      emoji: "heart",
    });
    const reactions = () =>
      t.run(async (ctx) => (await ctx.db.get(commentId))?.reactions);
    expect(await reactions()).toEqual({ heart: [ids.ownerA] });
    await ownerA.mutation(api.comments.toggleReaction, {
      commentId,
      emoji: "heart",
    });
    expect(await reactions()).toEqual({});
    await expect(
      ownerA.mutation(api.comments.toggleReaction, { commentId, emoji: "x" }),
    ).rejects.toThrow("Unsupported");
  });

  it("does not notify the author for self-mentions", async () => {
    const { ownerA, ids, t } = await setup();
    await t.run((ctx) => ctx.db.patch(ids.ownerA, { email: "boss@x.test" }));
    const taskId = await ownerA.mutation(api.tasks.create, {
      ...newTask(ids.projectA),
      assigneeUserId: ids.ownerA,
    });
    await ownerA.mutation(api.comments.create, {
      taskId,
      content: "@boss note @boss",
    });
    const count = await t.run(
      async (ctx) => (await ctx.db.query("notifications").collect()).length,
    );
    expect(count).toBe(0);
  });
});

describe("task updates", () => {
  it("clears optional fields with null", async () => {
    const { ownerA, ids } = await setup();
    const taskId = await ownerA.mutation(api.tasks.create, {
      ...newTask(ids.projectA),
      description: "d",
      assigneeUserId: ids.memberA,
      deadline: 1000,
      storyPoints: 3,
    });
    await ownerA.mutation(api.tasks.update, {
      taskId,
      updates: {
        description: null,
        assigneeUserId: null,
        deadline: null,
        storyPoints: null,
      },
    });
    const task = await ownerA.query(api.tasks.get, { taskId });
    expect(task?.description).toBeUndefined();
    expect(task?.assigneeUserId).toBeUndefined();
    expect(task?.deadline).toBeUndefined();
    expect(task?.storyPoints).toBeUndefined();
    expect(task?.title).toBe("task");
  });

  it("validates input", async () => {
    const { ownerA, ids } = await setup();
    await expect(
      ownerA.mutation(api.tasks.create, newTask(ids.projectA, "   ")),
    ).rejects.toThrow("Title is required");
    await expect(
      ownerA.mutation(api.tasks.create, newTask(ids.projectA, "x".repeat(201))),
    ).rejects.toThrow("too long");
    await expect(
      ownerA.mutation(api.tasks.create, {
        ...newTask(ids.projectA),
        storyPoints: -1,
      }),
    ).rejects.toThrow("Story points");
  });
});

describe("tags.update", () => {
  it("keeps fields that are not sent", async () => {
    const { ownerA, ids, t } = await setup();
    await t.run((ctx) => ctx.db.patch(ids.tagA, { color: "red" }));
    await ownerA.mutation(api.tags.update, { tagId: ids.tagA, name: "new" });
    const tag = await t.run((ctx) => ctx.db.get(ids.tagA));
    expect(tag).toMatchObject({ name: "new", color: "red" });
  });
});

describe("organizations", () => {
  it("creates a slug from a Persian name", async () => {
    const { ownerA } = await setup();
    const id = await ownerA.mutation(api.organizations.create, {
      name: "تیم من",
    });
    const orgs = await ownerA.query(api.organizations.listMine, {});
    expect(orgs.find((o) => o?._id === id)?.slug).toBe("تیم-من");
  });

  it("validates slug format and uniqueness on update", async () => {
    const { ownerA, ids } = await setup();
    await expect(
      ownerA.mutation(api.organizations.update, {
        organizationId: ids.orgA,
        updates: { slug: "bad slug!" },
      }),
    ).rejects.toThrow("Slug");
    await expect(
      ownerA.mutation(api.organizations.update, {
        organizationId: ids.orgA,
        updates: { slug: "org-b" },
      }),
    ).rejects.toThrow("already taken");
    await ownerA.mutation(api.organizations.update, {
      organizationId: ids.orgA,
      updates: { slug: "تیم-الف" },
    });
  });
});

describe("invites", () => {
  it("validates limits and exposes only public fields", async () => {
    const { ownerA, ids } = await setup();
    await expect(
      ownerA.mutation(api.invites.createLink, {
        organizationId: ids.orgA,
        maxUses: 0,
      }),
    ).rejects.toThrow("Max uses");
    await expect(
      ownerA.mutation(api.invites.createLink, {
        organizationId: ids.orgA,
        expiresAt: 1,
      }),
    ).rejects.toThrow("future");
    const token = await ownerA.mutation(api.invites.createLink, {
      organizationId: ids.orgA,
      maxUses: 1,
    });
    const info = await ownerA.query(api.invites.getByToken, { token });
    expect(Object.keys(info ?? {}).sort()).toEqual([
      "inviterName",
      "organizationName",
      "status",
    ]);
    expect(
      await ownerA.query(api.invites.list, { organizationId: ids.orgA }),
    ).toHaveLength(1);
  });
});

describe("mentions.listForMe", () => {
  it("drops mentions of deleted tasks", async () => {
    const { ownerA, memberA, ids, t } = await setup();
    await t.run((ctx) => ctx.db.patch(ids.memberA, { email: "mem@x.test" }));
    const taskId = await ownerA.mutation(
      api.tasks.create,
      newTask(ids.projectA),
    );
    await ownerA.mutation(api.comments.create, {
      taskId,
      content: "hi @mem",
    });
    expect(await memberA.query(api.mentions.listForMe, {})).toHaveLength(1);
    await ownerA.mutation(api.tasks.softDelete, { taskId });
    expect(await memberA.query(api.mentions.listForMe, {})).toHaveLength(0);
  });
});

describe("bulk operations and comment moderation", () => {
  it("returns the real count and skips tasks the caller cannot touch", async () => {
    const { ownerA, memberA, ids } = await setup();
    const own = await memberA.mutation(api.tasks.create, newTask(ids.projectA));
    const foreign = await ownerA.mutation(
      api.tasks.create,
      newTask(ids.projectA),
    );
    const updates = { priority: "high" as const };
    expect(
      await memberA.mutation(api.tasks.bulkUpdate, {
        ids: [own, foreign],
        updates,
      }),
    ).toBe(1);
    expect(
      await memberA.mutation(api.tasks.bulkDelete, { ids: [own, foreign] }),
    ).toBe(1);
  });

  it("lets the owner delete but not edit a member's comment", async () => {
    const { ownerA, memberA, ids } = await setup();
    const taskId = await ownerA.mutation(
      api.tasks.create,
      newTask(ids.projectA),
    );
    const commentId = await memberA.mutation(api.comments.create, {
      taskId,
      content: "hi",
    });
    await expect(
      ownerA.mutation(api.comments.update, {
        commentId,
        updates: { content: "x" },
      }),
    ).rejects.toThrow("only edit your own");
    await ownerA.mutation(api.comments.softDelete, { commentId });
  });
});
