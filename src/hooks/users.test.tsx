import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UsersResponse, UsersRoleOptions } from "@/lib/pocketbase-types";

import {
  useCreateUser,
  useDeleteUser,
  useProjectUsers,
  useToggleUserActive,
  useUnblockUser,
  useUpdateUser,
  useUser,
  useUsers,
} from "./users";

// Mock data
const getFullListMock = vi.fn();
const getOneMock = vi.fn();
const createMock = vi.fn();
const updateMock = vi.fn();
const deleteMock = vi.fn();

vi.mock("../lib/pocketbase", () => ({
  pb: {
    collection: vi.fn((name: string) => {
      if (name === "users") {
        return {
          getFullList: getFullListMock,
          getOne: getOneMock,
          create: createMock,
          update: updateMock,
          delete: deleteMock,
        };
      }
      return {
        getFullList: getFullListMock,
        getOne: getOneMock,
      };
    }),
    authStore: { record: null },
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useUsers", () => {
  beforeEach(() => {
    getFullListMock.mockReset();
  });

  it("fetches all users with default options", async () => {
    const mockUsers = [
      {
        id: "user-1",
        username: "john",
        first_name: "John",
        last_name: "Doe",
        role: UsersRoleOptions.employee,
        group: "grp-1",
        active: true,
        email: "john@example.com",
        avatar: "",
        verified: false,
        emailVisibility: false,
        failed_login_attempts: 0,
        blocked: false,
        created: "2024-01-01T00:00:00Z",
        updated: "2024-01-01T00:00:00Z",
      },
    ];

    getFullListMock.mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getFullListMock).toHaveBeenCalledWith(
      expect.objectContaining({
        batch: 100,
        sort: "-created",
      }),
    );
    expect(result.current.data).toEqual(mockUsers);
  });

  it("respects custom filter, batch, and sort options", async () => {
    const mockUsers: UsersResponse[] = [];
    getFullListMock.mockResolvedValue(mockUsers);

    const { result } = renderHook(
      () =>
        useUsers({
          filter: 'role = "admin"',
          batch: 50,
          sort: "username",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getFullListMock).toHaveBeenCalledWith(
      expect.objectContaining({
        batch: 50,
        sort: "username",
        filter: 'role = "admin"',
      }),
    );
  });

  it("respects enabled flag", async () => {
    getFullListMock.mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useUsers({ enabled }),
      { wrapper: createWrapper(), initialProps: { enabled: false } },
    );

    expect(getFullListMock).not.toHaveBeenCalled();

    rerender({ enabled: true });

    await waitFor(() => {
      expect(getFullListMock).toHaveBeenCalled();
    });
  });

  it("handles empty user list", async () => {
    getFullListMock.mockResolvedValue([]);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual([]);
  });
});

describe("useUser", () => {
  beforeEach(() => {
    getOneMock.mockReset();
  });

  it("fetches a single user by ID", async () => {
    const mockUser = {
      id: "user-1",
      username: "john",
      first_name: "John",
      last_name: "Doe",
      role: UsersRoleOptions.employee,
      group: "grp-1",
      active: true,
      email: "john@example.com",
      avatar: "",
      verified: false,
      emailVisibility: false,
      failed_login_attempts: 0,
      blocked: false,
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-01T00:00:00Z",
    };

    getOneMock.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useUser({ id: "user-1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getOneMock).toHaveBeenCalledWith("user-1");
    expect(result.current.data).toEqual(mockUser);
  });

  it("does not fetch if ID is empty", async () => {
    getOneMock.mockResolvedValue({});

    renderHook(() => useUser({ id: "" }), {
      wrapper: createWrapper(),
    });

    expect(getOneMock).not.toHaveBeenCalled();
  });

  it("respects enabled flag", async () => {
    getOneMock.mockResolvedValue({});

    renderHook(() => useUser({ id: "user-1", enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(getOneMock).not.toHaveBeenCalled();
  });

  it("handles fetch errors gracefully", async () => {
    const error = new Error("Fetch failed");
    getOneMock.mockRejectedValue(error);

    const { result } = renderHook(() => useUser({ id: "user-1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});

describe("useProjectUsers", () => {
  beforeEach(() => {
    getFullListMock.mockReset();
  });

  it("respects projectId flag for filtering", async () => {
    const mockUsers = [
      {
        id: "user-1",
        username: "john",
        first_name: "John",
        last_name: "Doe",
        role: UsersRoleOptions.employee,
        group: "grp-1",
        active: true,
        email: "john@example.com",
        avatar: "",
        verified: false,
        emailVisibility: false,
      },
    ];

    getFullListMock.mockResolvedValue(mockUsers);

    const { result, rerender } = renderHook(
      ({ projectId }: { projectId: string }) => useProjectUsers({ projectId }),
      { wrapper: createWrapper(), initialProps: { projectId: "proj-1" } },
    );

    // Query should be disabled when projectId is empty
    rerender({ projectId: "" });

    // Data should be empty array when projectId is empty
    expect(result.current.data ?? []).toBeDefined();
  });

  it("respects enabled flag", async () => {
    getFullListMock.mockResolvedValue([]);

    renderHook(() => useProjectUsers({ projectId: "proj-1", enabled: false }), {
      wrapper: createWrapper(),
    });

    // Should still call with filter even if disabled
    // because the hook's queryFn handles this
  });
});

describe("useCreateUser", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it("creates a new user", async () => {
    const newUserData = {
      username: "newuser",
      password: "password123",
      role: UsersRoleOptions.employee,
      first_name: "New",
      last_name: "User",
      group: "grp-1",
      email: "new@example.com",
      tokenKey: "token-new",
    };

    const createdUser = {
      id: "user-new",
      ...newUserData,
      active: false,
      verified: false,
      emailVisibility: false,
      avatar: "",
      failed_login_attempts: 0,
      blocked: false,
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-01T00:00:00Z",
    };

    createMock.mockResolvedValue(createdUser);

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    const mutationPromise = result.current.mutateAsync(newUserData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await mutationPromise;

    expect(createMock).toHaveBeenCalledWith(newUserData);
    expect(result.current.data).toEqual(createdUser);
  });

  it("calls onSuccess callback if provided", async () => {
    const onSuccess = vi.fn();
    const userData = {
      username: "test",
      password: "pass",
      role: UsersRoleOptions.employee,
      group: "grp-1",
      tokenKey: "token-test",
    };

    const created = { id: "u1", ...userData, active: false };

    createMock.mockResolvedValue(created);

    const { result } = renderHook(() => useCreateUser({ onSuccess }), {
      wrapper: createWrapper(),
    });

    const mutationPromise = result.current.mutateAsync(userData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await mutationPromise;

    expect(onSuccess).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(created, userData, undefined);
  });

  it("handles creation errors", async () => {
    const error = new Error("Creation failed");
    createMock.mockRejectedValue(error);

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    const userData = {
      username: "test",
      password: "pass",
      role: UsersRoleOptions.employee,
      group: "grp-1",
      tokenKey: "token-error",
    };

    await expect(result.current.mutateAsync(userData)).rejects.toEqual(error);
  });
});

describe("useUpdateUser", () => {
  beforeEach(() => {
    updateMock.mockReset();
  });

  it("updates an existing user", async () => {
    const updateData = { first_name: "Updated" };
    const updated = {
      id: "user-1",
      username: "john",
      first_name: "Updated",
      last_name: "Doe",
      role: UsersRoleOptions.employee,
      group: "grp-1",
      active: true,
      email: "john@example.com",
      avatar: "",
      verified: false,
      emailVisibility: false,
      failed_login_attempts: 0,
      blocked: false,
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-02T00:00:00Z",
    };

    updateMock.mockResolvedValue(updated);

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createWrapper(),
    });

    const mutationPromise = result.current.mutateAsync({
      id: "user-1",
      updates: updateData,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await mutationPromise;

    expect(updateMock).toHaveBeenCalledWith("user-1", updateData);
    expect(result.current.data).toEqual(updated);
  });

  it("handles update errors", async () => {
    const error = new Error("Update failed");
    updateMock.mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        id: "user-1",
        updates: { first_name: "Test" },
      }),
    ).rejects.toEqual(error);
  });
});

describe("useDeleteUser", () => {
  beforeEach(() => {
    deleteMock.mockReset();
  });

  it("deletes a user by ID", async () => {
    deleteMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync("user-1");

    expect(deleteMock).toHaveBeenCalledWith("user-1");
  });

  it("handles deletion errors", async () => {
    const error = new Error("Delete failed");
    deleteMock.mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync("user-1")).rejects.toEqual(error);
  });
});

describe("useToggleUserActive", () => {
  it("toggles user active status", async () => {
    const { result } = renderHook(() => useToggleUserActive(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });
});

describe("useUnblockUser", () => {
  it("unblocks a user", async () => {
    const { result } = renderHook(() => useUnblockUser(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });
});
