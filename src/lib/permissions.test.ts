import { describe, expect, it } from "vitest";
import {
  can,
  canCreateProjects,
  canManageUsers,
  hasAnyRole,
  isAdmin,
  isEmployee,
  isManager,
  isSupervisor,
} from "./permissions";
import { UsersRoleOptions } from "./pocketbase-types";

describe("can", () => {
  describe("projects.view permission", () => {
    it("should allow admin to view projects", () => {
      expect(can(UsersRoleOptions.admin, "projects.view")).toBe(true);
    });

    it("should allow manager to view projects", () => {
      expect(can(UsersRoleOptions.manager, "projects.view")).toBe(true);
    });

    it("should allow supervisor to view projects", () => {
      expect(can(UsersRoleOptions.supervisor, "projects.view")).toBe(true);
    });

    it("should allow employee to view projects", () => {
      expect(can(UsersRoleOptions.employee, "projects.view")).toBe(true);
    });
  });

  describe("projects.manage permission", () => {
    it("should allow admin to manage projects", () => {
      expect(can(UsersRoleOptions.admin, "projects.manage")).toBe(true);
    });

    it("should allow manager to manage projects", () => {
      expect(can(UsersRoleOptions.manager, "projects.manage")).toBe(true);
    });

    it("should allow supervisor to manage projects", () => {
      expect(can(UsersRoleOptions.supervisor, "projects.manage")).toBe(true);
    });

    it("should not allow employee to manage projects", () => {
      expect(can(UsersRoleOptions.employee, "projects.manage")).toBe(false);
    });
  });

  describe("projects.create permission", () => {
    it("should allow admin to create projects", () => {
      expect(can(UsersRoleOptions.admin, "projects.create")).toBe(true);
    });

    it("should allow manager to create projects", () => {
      expect(can(UsersRoleOptions.manager, "projects.create")).toBe(true);
    });

    it("should not allow supervisor to create projects", () => {
      expect(can(UsersRoleOptions.supervisor, "projects.create")).toBe(false);
    });

    it("should not allow employee to create projects", () => {
      expect(can(UsersRoleOptions.employee, "projects.create")).toBe(false);
    });
  });

  describe("users.view permission", () => {
    it("should allow admin to view users", () => {
      expect(can(UsersRoleOptions.admin, "users.view")).toBe(true);
    });

    it("should allow manager to view users", () => {
      expect(can(UsersRoleOptions.manager, "users.view")).toBe(true);
    });

    it("should allow supervisor to view users", () => {
      expect(can(UsersRoleOptions.supervisor, "users.view")).toBe(true);
    });

    it("should not allow employee to view users", () => {
      expect(can(UsersRoleOptions.employee, "users.view")).toBe(false);
    });
  });

  describe("users.manage permission", () => {
    it("should allow admin to manage users", () => {
      expect(can(UsersRoleOptions.admin, "users.manage")).toBe(true);
    });

    it("should allow manager to manage users", () => {
      expect(can(UsersRoleOptions.manager, "users.manage")).toBe(true);
    });

    it("should not allow supervisor to manage users", () => {
      expect(can(UsersRoleOptions.supervisor, "users.manage")).toBe(false);
    });

    it("should not allow employee to manage users", () => {
      expect(can(UsersRoleOptions.employee, "users.manage")).toBe(false);
    });
  });

  describe("reports.view permission", () => {
    it("should allow admin to view reports", () => {
      expect(can(UsersRoleOptions.admin, "reports.view")).toBe(true);
    });

    it("should allow manager to view reports", () => {
      expect(can(UsersRoleOptions.manager, "reports.view")).toBe(true);
    });

    it("should allow supervisor to view reports", () => {
      expect(can(UsersRoleOptions.supervisor, "reports.view")).toBe(true);
    });

    it("should not allow employee to view reports", () => {
      expect(can(UsersRoleOptions.employee, "reports.view")).toBe(false);
    });
  });

  describe("tasks.view permission", () => {
    it("should allow admin to view tasks", () => {
      expect(can(UsersRoleOptions.admin, "tasks.view")).toBe(true);
    });

    it("should allow manager to view tasks", () => {
      expect(can(UsersRoleOptions.manager, "tasks.view")).toBe(true);
    });

    it("should allow supervisor to view tasks", () => {
      expect(can(UsersRoleOptions.supervisor, "tasks.view")).toBe(true);
    });

    it("should allow employee to view tasks", () => {
      expect(can(UsersRoleOptions.employee, "tasks.view")).toBe(true);
    });
  });

  describe("tasks.manage permission", () => {
    it("should allow admin to manage tasks", () => {
      expect(can(UsersRoleOptions.admin, "tasks.manage")).toBe(true);
    });

    it("should allow manager to manage tasks", () => {
      expect(can(UsersRoleOptions.manager, "tasks.manage")).toBe(true);
    });

    it("should allow supervisor to manage tasks", () => {
      expect(can(UsersRoleOptions.supervisor, "tasks.manage")).toBe(true);
    });

    it("should not allow employee to manage tasks", () => {
      expect(can(UsersRoleOptions.employee, "tasks.manage")).toBe(false);
    });
  });

  describe("groups.view permission", () => {
    it("should allow admin to view groups", () => {
      expect(can(UsersRoleOptions.admin, "groups.view")).toBe(true);
    });

    it("should not allow manager to view groups", () => {
      expect(can(UsersRoleOptions.manager, "groups.view")).toBe(false);
    });

    it("should not allow supervisor to view groups", () => {
      expect(can(UsersRoleOptions.supervisor, "groups.view")).toBe(false);
    });

    it("should not allow employee to view groups", () => {
      expect(can(UsersRoleOptions.employee, "groups.view")).toBe(false);
    });
  });

  describe("groups.manage permission", () => {
    it("should allow admin to manage groups", () => {
      expect(can(UsersRoleOptions.admin, "groups.manage")).toBe(true);
    });

    it("should not allow manager to manage groups", () => {
      expect(can(UsersRoleOptions.manager, "groups.manage")).toBe(false);
    });

    it("should not allow supervisor to manage groups", () => {
      expect(can(UsersRoleOptions.supervisor, "groups.manage")).toBe(false);
    });

    it("should not allow employee to manage groups", () => {
      expect(can(UsersRoleOptions.employee, "groups.manage")).toBe(false);
    });
  });

  describe("null role handling", () => {
    it("should return false for null role", () => {
      expect(can(null, "projects.view")).toBe(false);
    });

    it("should return false for null role on any permission", () => {
      expect(can(null, "users.manage")).toBe(false);
    });
  });
});

describe("hasAnyRole", () => {
  it("should return true when user has admin role", () => {
    expect(
      hasAnyRole(UsersRoleOptions.admin, [
        UsersRoleOptions.admin,
        UsersRoleOptions.supervisor,
      ]),
    ).toBe(true);
  });

  it("should return true when user has supervisor role", () => {
    expect(
      hasAnyRole(UsersRoleOptions.supervisor, [
        UsersRoleOptions.admin,
        UsersRoleOptions.supervisor,
      ]),
    ).toBe(true);
  });

  it("should return true when user has manager role", () => {
    expect(
      hasAnyRole(UsersRoleOptions.manager, [
        UsersRoleOptions.admin,
        UsersRoleOptions.manager,
      ]),
    ).toBe(true);
  });

  it("should return false when user does not have any of the roles", () => {
    expect(
      hasAnyRole(UsersRoleOptions.employee, [
        UsersRoleOptions.admin,
        UsersRoleOptions.supervisor,
      ]),
    ).toBe(false);
  });

  it("should return true when checking single role match", () => {
    expect(
      hasAnyRole(UsersRoleOptions.employee, [UsersRoleOptions.employee]),
    ).toBe(true);
  });

  it("should return false for null role", () => {
    expect(hasAnyRole(null, [UsersRoleOptions.admin])).toBe(false);
  });

  it("should return false for empty roles array", () => {
    expect(hasAnyRole(UsersRoleOptions.admin, [])).toBe(false);
  });
});

describe("isAdmin", () => {
  it("should return true for admin role", () => {
    expect(isAdmin(UsersRoleOptions.admin)).toBe(true);
  });

  it("should return false for manager role", () => {
    expect(isAdmin(UsersRoleOptions.manager)).toBe(false);
  });

  it("should return false for supervisor role", () => {
    expect(isAdmin(UsersRoleOptions.supervisor)).toBe(false);
  });

  it("should return false for employee role", () => {
    expect(isAdmin(UsersRoleOptions.employee)).toBe(false);
  });

  it("should return false for null role", () => {
    expect(isAdmin(null)).toBe(false);
  });
});

describe("isManager", () => {
  it("should return true for manager role", () => {
    expect(isManager(UsersRoleOptions.manager)).toBe(true);
  });

  it("should return false for admin role", () => {
    expect(isManager(UsersRoleOptions.admin)).toBe(false);
  });

  it("should return false for supervisor role", () => {
    expect(isManager(UsersRoleOptions.supervisor)).toBe(false);
  });

  it("should return false for employee role", () => {
    expect(isManager(UsersRoleOptions.employee)).toBe(false);
  });

  it("should return false for null role", () => {
    expect(isManager(null)).toBe(false);
  });
});

describe("isSupervisor", () => {
  it("should return true for supervisor role", () => {
    expect(isSupervisor(UsersRoleOptions.supervisor)).toBe(true);
  });

  it("should return false for admin role", () => {
    expect(isSupervisor(UsersRoleOptions.admin)).toBe(false);
  });

  it("should return false for manager role", () => {
    expect(isSupervisor(UsersRoleOptions.manager)).toBe(false);
  });

  it("should return false for employee role", () => {
    expect(isSupervisor(UsersRoleOptions.employee)).toBe(false);
  });

  it("should return false for null role", () => {
    expect(isSupervisor(null)).toBe(false);
  });
});

describe("isEmployee", () => {
  it("should return true for employee role", () => {
    expect(isEmployee(UsersRoleOptions.employee)).toBe(true);
  });

  it("should return false for admin role", () => {
    expect(isEmployee(UsersRoleOptions.admin)).toBe(false);
  });

  it("should return false for manager role", () => {
    expect(isEmployee(UsersRoleOptions.manager)).toBe(false);
  });

  it("should return false for supervisor role", () => {
    expect(isEmployee(UsersRoleOptions.supervisor)).toBe(false);
  });

  it("should return false for null role", () => {
    expect(isEmployee(null)).toBe(false);
  });
});

describe("canManageUsers", () => {
  it("should return true for admin role", () => {
    expect(canManageUsers(UsersRoleOptions.admin)).toBe(true);
  });

  it("should return true for manager role", () => {
    expect(canManageUsers(UsersRoleOptions.manager)).toBe(true);
  });

  it("should return false for supervisor role", () => {
    expect(canManageUsers(UsersRoleOptions.supervisor)).toBe(false);
  });

  it("should return false for employee role", () => {
    expect(canManageUsers(UsersRoleOptions.employee)).toBe(false);
  });

  it("should return false for null role", () => {
    expect(canManageUsers(null)).toBe(false);
  });
});

describe("canCreateProjects", () => {
  it("should return true for admin role", () => {
    expect(canCreateProjects(UsersRoleOptions.admin)).toBe(true);
  });

  it("should return true for manager role", () => {
    expect(canCreateProjects(UsersRoleOptions.manager)).toBe(true);
  });

  it("should return false for supervisor role", () => {
    expect(canCreateProjects(UsersRoleOptions.supervisor)).toBe(false);
  });

  it("should return false for employee role", () => {
    expect(canCreateProjects(UsersRoleOptions.employee)).toBe(false);
  });

  it("should return false for null role", () => {
    expect(canCreateProjects(null)).toBe(false);
  });
});
