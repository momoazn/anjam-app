import { describe, expect, it } from "vitest";

import {
  canDeleteTask,
  canEditTask,
  computePermissions,
  isOrgAdmin,
  isOrgMember,
  isOrgOwner,
} from "./permissions";

describe("organization role helpers", () => {
  it("identifies owners", () => {
    expect(isOrgOwner("owner")).toBe(true);
    expect(isOrgOwner("member")).toBe(false);
  });

  it("identifies admins (same as owner)", () => {
    expect(isOrgAdmin("owner")).toBe(true);
    expect(isOrgAdmin("member")).toBe(false);
  });

  it("identifies members", () => {
    expect(isOrgMember("owner")).toBe(true);
    expect(isOrgMember("member")).toBe(true);
    expect(isOrgMember(null)).toBe(false);
  });
});

describe("computePermissions", () => {
  it("grants org owner full project permissions", () => {
    const permissions = computePermissions("owner", "viewer");
    expect(permissions["project.view"]).toBe(true);
    expect(permissions["project.manage_members"]).toBe(true);
    expect(permissions["task.create"]).toBe(true);
  });

  it("restricts project members to own-task updates", () => {
    const permissions = computePermissions("member", "member");
    expect(permissions["task.update"]).toBe(false);
    expect(permissions["task.update_own"]).toBe(true);
    expect(permissions["project.manage_members"]).toBe(false);
  });

  it("allows viewers to view tasks only", () => {
    const permissions = computePermissions("member", "viewer");
    expect(permissions["task.view"]).toBe(true);
    expect(permissions["task.create"]).toBe(false);
  });
});

const task = { creatorUserId: "creator", assigneeUserId: "assignee" };

describe("task permissions", () => {
  it("lets the owner do everything", () => {
    expect(canEditTask("owner", task, "x")).toBe(true);
    expect(canDeleteTask("owner", task, "x")).toBe(true);
  });
  it("lets the creator edit and delete", () => {
    expect(canEditTask("member", task, "creator")).toBe(true);
    expect(canDeleteTask("member", task, "creator")).toBe(true);
  });
  it("lets the assignee edit but not delete", () => {
    expect(canEditTask("member", task, "assignee")).toBe(true);
    expect(canDeleteTask("member", task, "assignee")).toBe(false);
  });
  it("blocks other members and signed-out users", () => {
    expect(canEditTask("member", task, "other")).toBe(false);
    expect(canDeleteTask("member", task, "other")).toBe(false);
    expect(canEditTask("member", task, undefined)).toBe(false);
  });
});
