import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FileNameString, UsersResponse } from "@/lib/pocketbase-types";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { render } from "@/test/test-utils";

import Users from "./users";

const mockNavigate = vi.fn();

let mockAuthUser: UsersResponse | null = null;
let mockUsersData: UsersResponse[] = [];

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/hooks", () => ({
  useUsers: () => ({
    data: mockUsersData,
    isPending: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/store/auth-store", () => ({
  useAuthUser: () => mockAuthUser,
}));

vi.mock("@/components/user/user-list-table", () => ({
  UserListTable: (props: {
    users: UsersResponse[];
    onEdit: (user: UsersResponse) => void;
  }) => {
    if (props.users.length > 0) {
      props.onEdit(props.users[0]);
    }
    return <div data-testid="user-list-table" />;
  },
}));

vi.mock("@/components/user/delete-user-dialog", () => ({
  DeleteUserDialog: () => <div data-testid="delete-dialog" />,
}));

describe("Users page edit permissions", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockAuthUser = null;
    mockUsersData = [];
  });

  function buildUser(
    overrides: Partial<UsersResponse> & { id: string; role: UsersRoleOptions },
  ): UsersResponse {
    const { id, role, ...rest } = overrides;
    return {
      username: "user",
      created: "",
      updated: "",
      email: "",
      password: "",
      verified: false,
      emailVisibility: false,
      first_name: "Test",
      last_name: "User",
      active: true,
      blocked: false,
      blocked_at: "",
      blocked_reason: "",
      failed_login_attempts: 0,
      avatar: "" as unknown as FileNameString,
      id,
      role,
      tokenKey: "",
      ...rest,
    } as UsersResponse;
  }

  it("prevents non-admins from editing other users", () => {
    mockAuthUser = buildUser({ id: "auth-1", role: UsersRoleOptions.manager });
    mockUsersData = [
      buildUser({ id: "other-1", role: UsersRoleOptions.employee }),
    ];

    render(<Users />);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("allows admins to edit any user", () => {
    mockAuthUser = buildUser({ id: "admin-1", role: UsersRoleOptions.admin });
    mockUsersData = [
      buildUser({ id: "target-1", role: UsersRoleOptions.employee }),
    ];

    render(<Users />);

    expect(mockNavigate).toHaveBeenCalledWith("/users/target-1/edit");
  });

  it("allows non-admins to edit themselves", () => {
    mockAuthUser = buildUser({
      id: "self-1",
      role: UsersRoleOptions.supervisor,
    });
    mockUsersData = [
      buildUser({ id: "self-1", role: UsersRoleOptions.supervisor }),
    ];

    render(<Users />);

    expect(mockNavigate).toHaveBeenCalledWith("/users/self-1/edit");
  });
});
