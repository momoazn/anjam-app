import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import {
  useGroups,
  useGroup,
  useGroupUsers,
  useGroupProjects,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
} from "./groups";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock data
const getFullListMock = vi.fn();
const getOneMock = vi.fn();
const createMock = vi.fn();
const updateMock = vi.fn();
const deleteMock = vi.fn();

vi.mock("@/lib/pocketbase", () => ({
  pb: {
    collection: vi.fn((name: string) => {
      if (name === "groups") {
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

describe("useGroups", () => {
  beforeEach(() => {
    getFullListMock.mockReset();
  });

  it("fetches all groups with manager expansion", async () => {
    const mockGroups = [
      {
        id: "grp-1",
        name: "Engineering",
        description: "Engineering team",
        manager: "mgr-1",
        active: true,
        created: "2024-01-01T00:00:00Z",
        updated: "2024-01-01T00:00:00Z",
        expand: {
          manager: {
            id: "mgr-1",
            username: "manager1",
            first_name: "John",
            last_name: "Manager",
          },
        },
      },
    ];

    getFullListMock.mockResolvedValue(mockGroups);

    const { result } = renderHook(() => useGroups(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getFullListMock).toHaveBeenCalledWith({
      sort: "-created",
      expand: "manager",
    });
    expect(result.current.data).toEqual(mockGroups);
  });

  it("respects enabled flag", async () => {
    getFullListMock.mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useGroups({ enabled }),
      { wrapper: createWrapper(), initialProps: { enabled: false } },
    );

    expect(getFullListMock).not.toHaveBeenCalled();

    rerender({ enabled: true });

    await waitFor(() => {
      expect(getFullListMock).toHaveBeenCalled();
    });
  });

  it("handles empty group list", async () => {
    getFullListMock.mockResolvedValue([]);

    const { result } = renderHook(() => useGroups(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual([]);
  });
});

describe("useGroup", () => {
  beforeEach(() => {
    getOneMock.mockReset();
  });

  it("fetches a single group with manager expansion", async () => {
    const mockGroup = {
      id: "grp-1",
      name: "Engineering",
      description: "Engineering team",
      manager: "mgr-1",
      active: true,
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-01T00:00:00Z",
      expand: {
        manager: {
          id: "mgr-1",
          username: "manager1",
          first_name: "John",
          last_name: "Manager",
        },
      },
    };

    getOneMock.mockResolvedValue(mockGroup);

    const { result } = renderHook(() => useGroup({ id: "grp-1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getOneMock).toHaveBeenCalledWith("grp-1", { expand: "manager" });
    expect(result.current.data).toEqual(mockGroup);
  });

  it("does not fetch if ID is empty", async () => {
    getOneMock.mockResolvedValue({});

    renderHook(() => useGroup({ id: "" }), {
      wrapper: createWrapper(),
    });

    expect(getOneMock).not.toHaveBeenCalled();
  });

  it("respects enabled flag", async () => {
    getOneMock.mockResolvedValue({});

    renderHook(() => useGroup({ id: "grp-1", enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(getOneMock).not.toHaveBeenCalled();
  });
});

describe("useGroupUsers", () => {
  beforeEach(() => {
    getFullListMock.mockReset();
  });

  it("fetches users in a specific group", async () => {
    const mockUsers = [
      {
        id: "user-1",
        username: "employee1",
        first_name: "John",
        last_name: "Doe",
        role: "employee",
        group: "grp-1",
        active: true,
        email: "john@example.com",
        avatar: "",
        verified: false,
        emailVisibility: false,
      },
    ];

    getFullListMock.mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useGroupUsers({ groupId: "grp-1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getFullListMock).toHaveBeenCalledWith({
      filter: 'group.id = "grp-1"',
    });
    expect(result.current.data).toEqual(mockUsers);
  });

  it("does not fetch if groupId is empty", async () => {
    getFullListMock.mockResolvedValue([]);

    renderHook(() => useGroupUsers({ groupId: "" }), {
      wrapper: createWrapper(),
    });

    expect(getFullListMock).not.toHaveBeenCalled();
  });

  it("respects enabled flag", async () => {
    getFullListMock.mockResolvedValue([]);

    renderHook(() => useGroupUsers({ groupId: "grp-1", enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(getFullListMock).not.toHaveBeenCalled();
  });

  it("handles empty user list for group", async () => {
    getFullListMock.mockResolvedValue([]);

    const { result } = renderHook(() => useGroupUsers({ groupId: "grp-1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual([]);
  });
});

describe("useGroupProjects", () => {
  beforeEach(() => {
    getFullListMock.mockReset();
  });

  it("fetches projects in a specific group", async () => {
    const mockProjects = [
      {
        id: "proj-1",
        name: "Project 1",
        code: "PRJ",
        supervisor: "sup-1",
        group: "grp-1",
        created: "2024-01-01T00:00:00Z",
        updated: "2024-01-01T00:00:00Z",
      },
    ];

    getFullListMock.mockResolvedValue(mockProjects);

    const { result } = renderHook(
      () => useGroupProjects({ groupId: "grp-1" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getFullListMock).toHaveBeenCalledWith({
      filter: 'group.id = "grp-1"',
    });
    expect(result.current.data).toEqual(mockProjects);
  });

  it("does not fetch if groupId is empty", async () => {
    getFullListMock.mockResolvedValue([]);

    renderHook(() => useGroupProjects({ groupId: "" }), {
      wrapper: createWrapper(),
    });

    expect(getFullListMock).not.toHaveBeenCalled();
  });

  it("respects enabled flag", async () => {
    getFullListMock.mockResolvedValue([]);

    renderHook(() => useGroupProjects({ groupId: "grp-1", enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(getFullListMock).not.toHaveBeenCalled();
  });

  it("handles empty project list for group", async () => {
    getFullListMock.mockResolvedValue([]);

    const { result } = renderHook(
      () => useGroupProjects({ groupId: "grp-1" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual([]);
  });
});

describe("useCreateGroup", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it("creates a new group", async () => {
    const newGroupData = {
      name: "New Group",
      description: "Test group",
      manager: "mgr-1",
    };

    const createdGroup = {
      id: "grp-new",
      ...newGroupData,
      active: true,
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-01T00:00:00Z",
    };

    createMock.mockResolvedValue(createdGroup);

    const { result } = renderHook(() => useCreateGroup(), {
      wrapper: createWrapper(),
    });

    const mutationPromise = result.current.mutateAsync(newGroupData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await mutationPromise;

    expect(createMock).toHaveBeenCalledWith(newGroupData);
    expect(result.current.data).toEqual(createdGroup);
  });

  it("handles creation errors", async () => {
    const error = new Error("Creation failed");
    createMock.mockRejectedValue(error);

    const { result } = renderHook(() => useCreateGroup(), {
      wrapper: createWrapper(),
    });

    const groupData = { name: "Test", description: "", manager: "mgr-1" };

    await expect(result.current.mutateAsync(groupData)).rejects.toEqual(error);
  });
});

describe("useUpdateGroup", () => {
  beforeEach(() => {
    updateMock.mockReset();
  });

  it("updates an existing group", async () => {
    const updateData = { name: "Updated Group" };
    const updated = {
      id: "grp-1",
      name: "Updated Group",
      description: "Test",
      manager: "mgr-1",
      active: true,
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-02T00:00:00Z",
    };

    updateMock.mockResolvedValue(updated);

    const { result } = renderHook(() => useUpdateGroup(), {
      wrapper: createWrapper(),
    });

    const mutationPromise = result.current.mutateAsync({
      id: "grp-1",
      updates: updateData,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await mutationPromise;

    expect(updateMock).toHaveBeenCalledWith("grp-1", updateData);
    expect(result.current.data).toEqual(updated);
  });

  it("handles update errors", async () => {
    const error = new Error("Update failed");
    updateMock.mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateGroup(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        id: "grp-1",
        updates: { name: "Test" },
      }),
    ).rejects.toEqual(error);
  });
});

describe("useDeleteGroup", () => {
  beforeEach(() => {
    deleteMock.mockReset();
  });

  it("deletes a group by ID", async () => {
    deleteMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteGroup(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync("grp-1");

    expect(deleteMock).toHaveBeenCalledWith("grp-1");
  });

  it("handles deletion errors", async () => {
    const error = new Error("Delete failed");
    deleteMock.mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteGroup(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync("grp-1")).rejects.toEqual(error);
  });
});
