import { describe, it, expect } from "vitest";
import {
  can,
  hasAnyRole,
  isAdmin,
  isSupervisor,
  isEmployee,
  type Permission,
} from "./permissions";

describe("can", () => {
  describe("projects.view permission", () => {
    it("should allow admin to view projects", () => {
      expect(can("admin", "projects.view")).toBe(true);
    });

    it("should allow supervisor to view projects", () => {
      expect(can("supervisor", "projects.view")).toBe(true);
    });

    it("should allow employee to view projects", () => {
      expect(can("employee", "projects.view")).toBe(true);
    });
  });

  describe("projects.manage permission", () => {
    it("should allow admin to manage projects", () => {
      expect(can("admin", "projects.manage")).toBe(true);
    });

    it("should allow supervisor to manage projects", () => {
      expect(can("supervisor", "projects.manage")).toBe(true);
    });

    it("should not allow employee to manage projects", () => {
      expect(can("employee", "projects.manage")).toBe(false);
    });
  });

  describe("users.view permission", () => {
    it("should allow admin to view users", () => {
      expect(can("admin", "users.view")).toBe(true);
    });

    it("should not allow supervisor to view users", () => {
      expect(can("supervisor", "users.view")).toBe(false);
    });

    it("should not allow employee to view users", () => {
      expect(can("employee", "users.view")).toBe(false);
    });
  });

  describe("users.manage permission", () => {
    it("should allow admin to manage users", () => {
      expect(can("admin", "users.manage")).toBe(true);
    });

    it("should not allow supervisor to manage users", () => {
      expect(can("supervisor", "users.manage")).toBe(false);
    });

    it("should not allow employee to manage users", () => {
      expect(can("employee", "users.manage")).toBe(false);
    });
  });

  describe("reports.view permission", () => {
    it("should allow admin to view reports", () => {
      expect(can("admin", "reports.view")).toBe(true);
    });

    it("should allow supervisor to view reports", () => {
      expect(can("supervisor", "reports.view")).toBe(true);
    });

    it("should not allow employee to view reports", () => {
      expect(can("employee", "reports.view")).toBe(false);
    });
  });

  describe("tasks permissions", () => {
    const permissions: Permission[] = ["tasks.view", "tasks.manage"];

    permissions.forEach((permission) => {
      describe(permission, () => {
        it("should allow admin", () => {
          expect(can("admin", permission)).toBe(true);
        });

        it("should allow supervisor", () => {
          expect(can("supervisor", permission)).toBe(true);
        });

        it("should allow employee", () => {
          expect(can("employee", permission)).toBe(true);
        });
      });
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
    expect(hasAnyRole("admin", ["admin", "supervisor"])).toBe(true);
  });

  it("should return true when user has supervisor role", () => {
    expect(hasAnyRole("supervisor", ["admin", "supervisor"])).toBe(true);
  });

  it("should return false when user does not have any of the roles", () => {
    expect(hasAnyRole("employee", ["admin", "supervisor"])).toBe(false);
  });

  it("should return true when checking single role match", () => {
    expect(hasAnyRole("employee", ["employee"])).toBe(true);
  });

  it("should return false for null role", () => {
    expect(hasAnyRole(null, ["admin"])).toBe(false);
  });

  it("should return false for empty roles array", () => {
    expect(hasAnyRole("admin", [])).toBe(false);
  });
});

describe("isAdmin", () => {
  it("should return true for admin role", () => {
    expect(isAdmin("admin")).toBe(true);
  });

  it("should return false for supervisor role", () => {
    expect(isAdmin("supervisor")).toBe(false);
  });

  it("should return false for employee role", () => {
    expect(isAdmin("employee")).toBe(false);
  });

  it("should return false for null role", () => {
    expect(isAdmin(null)).toBe(false);
  });
});

describe("isSupervisor", () => {
  it("should return true for supervisor role", () => {
    expect(isSupervisor("supervisor")).toBe(true);
  });

  it("should return false for admin role", () => {
    expect(isSupervisor("admin")).toBe(false);
  });

  it("should return false for employee role", () => {
    expect(isSupervisor("employee")).toBe(false);
  });

  it("should return false for null role", () => {
    expect(isSupervisor(null)).toBe(false);
  });
});

describe("isEmployee", () => {
  it("should return true for employee role", () => {
    expect(isEmployee("employee")).toBe(true);
  });

  it("should return false for admin role", () => {
    expect(isEmployee("admin")).toBe(false);
  });

  it("should return false for supervisor role", () => {
    expect(isEmployee("supervisor")).toBe(false);
  });

  it("should return false for null role", () => {
    expect(isEmployee(null)).toBe(false);
  });
});
