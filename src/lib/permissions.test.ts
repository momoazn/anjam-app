import { describe, expect, it } from "vitest";

import {
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
