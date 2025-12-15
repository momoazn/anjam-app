import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import {
  useProjects,
  useProject,
  useProjectWithSupervisor,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "./projects";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProjectsResponse } from "@/lib/pocketbase-types";
import { Collections } from "@/lib/pocketbase-types";

// Mock data
const getFullListMock = vi.fn();
const getOneMock = vi.fn();
const createMock = vi.fn();
const updateMock = vi.fn();
const deleteMock = vi.fn();

vi.mock("../lib/pocketbase", () => ({
  pb: {
    collection: vi.fn(() => ({
      getFullList: getFullListMock,
      getOne: getOneMock,
      create: createMock,
      update: updateMock,
      delete: deleteMock,
    })),
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

describe("useProjects", () => {
  beforeEach(() => {
    getFullListMock.mockReset();
  });

  it("fetches all projects with default options", async () => {
    const mockProjects: ProjectsResponse[] = [
      {
        id: "proj-1",
        name: "Project 1",
        code: "PRJ",
        supervisor: "sup-1",
        group: "grp-1",
        assets: [],
        description: "Test project",
        collectionId: Collections.Projects,
        collectionName: Collections.Projects,
        created: "2024-01-01T00:00:00Z",
        updated: "2024-01-01T00:00:00Z",
      },
    ];

    getFullListMock.mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getFullListMock).toHaveBeenCalledWith({
      batch: 100,
      sort: "-created",
    });
    expect(result.current.data).toEqual(mockProjects);
  });

  it("respects custom batch and sort options", async () => {
    const mockProjects: ProjectsResponse[] = [];
    getFullListMock.mockResolvedValue(mockProjects);

    const { result } = renderHook(
      () => useProjects({ batch: 50, sort: "name" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getFullListMock).toHaveBeenCalledWith({
      batch: 50,
      sort: "name",
    });
  });

  it("respects enabled flag", async () => {
    getFullListMock.mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useProjects({ enabled }),
      { wrapper: createWrapper(), initialProps: { enabled: false } },
    );

    // Should not call function when disabled
    expect(getFullListMock).not.toHaveBeenCalled();

    rerender({ enabled: true });

    await waitFor(() => {
      expect(getFullListMock).toHaveBeenCalled();
    });
  });

  it("handles empty project list", async () => {
    getFullListMock.mockResolvedValue([]);

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual([]);
  });
});

describe("useProject", () => {
  beforeEach(() => {
    getOneMock.mockReset();
  });

  it("fetches a single project by ID", async () => {
    const mockProject = {
      id: "proj-1",
      name: "Project 1",
      code: "PRJ",
      supervisor: "sup-1",
      group: "grp-1",
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-01T00:00:00Z",
    };

    getOneMock.mockResolvedValue(mockProject);

    const { result } = renderHook(() => useProject({ id: "proj-1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getOneMock).toHaveBeenCalledWith("proj-1");
    expect(result.current.data).toEqual(mockProject);
  });

  it("does not fetch if ID is empty", async () => {
    getOneMock.mockResolvedValue({});

    renderHook(() => useProject({ id: "" }), {
      wrapper: createWrapper(),
    });

    // Query should be disabled when ID is empty
    expect(getOneMock).not.toHaveBeenCalled();
  });

  it("respects enabled flag", async () => {
    getOneMock.mockResolvedValue({});

    renderHook(() => useProject({ id: "proj-1", enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(getOneMock).not.toHaveBeenCalled();
  });

  it("handles fetch errors gracefully", async () => {
    const error = new Error("Fetch failed");
    getOneMock.mockRejectedValue(error);

    const { result } = renderHook(() => useProject({ id: "proj-1" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});

describe("useProjectWithSupervisor", () => {
  beforeEach(() => {
    getOneMock.mockReset();
  });

  it("fetches project with supervisor expansion", async () => {
    const mockProject = {
      id: "proj-1",
      name: "Project 1",
      code: "PRJ",
      supervisor: "sup-1",
      group: "grp-1",
      expand: {
        supervisor: {
          id: "sup-1",
          username: "supervisor",
          first_name: "John",
          last_name: "Doe",
        },
      },
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-01T00:00:00Z",
    };

    getOneMock.mockResolvedValue(mockProject);

    const { result } = renderHook(
      () => useProjectWithSupervisor({ id: "proj-1" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getOneMock).toHaveBeenCalledWith("proj-1", { expand: "supervisor" });
    expect(result.current.data?.expand?.supervisor).toBeDefined();
  });

  it("respects disabled state", async () => {
    getOneMock.mockResolvedValue({});

    renderHook(
      () => useProjectWithSupervisor({ id: "proj-1", enabled: false }),
      { wrapper: createWrapper() },
    );

    expect(getOneMock).not.toHaveBeenCalled();
  });
});

describe("useCreateProject", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it("creates a new project", async () => {
    const newProjectData = {
      name: "New Project",
      code: "NEW",
      supervisor: "sup-1",
      group: "grp-1",
    };

    const createdProject = {
      id: "proj-new",
      ...newProjectData,
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-01T00:00:00Z",
    };

    createMock.mockResolvedValue(createdProject);

    const { result } = renderHook(() => useCreateProject(), {
      wrapper: createWrapper(),
    });

    const mutationPromise = result.current.mutateAsync(newProjectData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await mutationPromise;

    expect(createMock).toHaveBeenCalledWith(newProjectData);
    expect(result.current.data).toEqual(createdProject);
  });

  it("calls onSuccess callback if provided", async () => {
    const onSuccess = vi.fn();
    const projectData = {
      name: "Test",
      code: "TST",
      supervisor: "sup-1",
      group: "grp-1",
    };

    const createdProject = {
      id: "proj-1",
      ...projectData,
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-01T00:00:00Z",
    };

    createMock.mockResolvedValue(createdProject);

    const { result } = renderHook(() => useCreateProject({ onSuccess }), {
      wrapper: createWrapper(),
    });

    const mutationPromise = result.current.mutateAsync(projectData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await mutationPromise;

    expect(onSuccess).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(
      createdProject,
      projectData,
      undefined,
    );
  });

  it("handles creation errors", async () => {
    const error = new Error("Creation failed");
    createMock.mockRejectedValue(error);

    const { result } = renderHook(() => useCreateProject(), {
      wrapper: createWrapper(),
    });

    const projectData = {
      name: "Test",
      code: "TST",
      supervisor: "sup-1",
      group: "grp-1",
    };

    await expect(result.current.mutateAsync(projectData)).rejects.toEqual(
      error,
    );
  });
});

describe("useUpdateProject", () => {
  beforeEach(() => {
    updateMock.mockReset();
  });

  it("updates an existing project", async () => {
    const updateData = { name: "Updated Project" };
    const updated = {
      id: "proj-1",
      name: "Updated Project",
      code: "UPD",
      supervisor: "sup-1",
      group: "grp-1",
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-02T00:00:00Z",
    };

    updateMock.mockResolvedValue(updated);

    const { result } = renderHook(() => useUpdateProject(), {
      wrapper: createWrapper(),
    });

    const mutationPromise = result.current.mutateAsync({
      id: "proj-1",
      updates: updateData,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await mutationPromise;

    expect(updateMock).toHaveBeenCalledWith("proj-1", updateData);
    expect(result.current.data).toEqual(updated);
  });

  it("calls onSuccess callback if provided", async () => {
    const onSuccess = vi.fn();
    const updateData = { name: "Updated" };

    const updated = {
      id: "proj-1",
      name: "Updated",
      code: "UPD",
      supervisor: "sup-1",
      group: "grp-1",
      created: "2024-01-01T00:00:00Z",
      updated: "2024-01-02T00:00:00Z",
    };

    updateMock.mockResolvedValue(updated);

    const { result } = renderHook(() => useUpdateProject({ onSuccess }), {
      wrapper: createWrapper(),
    });

    const mutationPromise = result.current.mutateAsync({
      id: "proj-1",
      updates: updateData,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await mutationPromise;

    expect(onSuccess).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(
      updated,
      { id: "proj-1", updates: updateData },
      undefined,
    );
  });

  it("handles update errors", async () => {
    const error = new Error("Update failed");
    updateMock.mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateProject(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        id: "proj-1",
        updates: { name: "Test" },
      }),
    ).rejects.toEqual(error);
  });
});

describe("useDeleteProject", () => {
  beforeEach(() => {
    deleteMock.mockReset();
  });

  it("deletes a project by ID", async () => {
    deleteMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteProject(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync("proj-1");

    expect(deleteMock).toHaveBeenCalledWith("proj-1");
  });

  it("calls onSuccess callback if provided", async () => {
    const onSuccess = vi.fn();
    deleteMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteProject({ onSuccess }), {
      wrapper: createWrapper(),
    });

    const mutationPromise = result.current.mutateAsync("proj-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await mutationPromise;

    expect(onSuccess).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(undefined, "proj-1", undefined);
  });

  it("handles deletion errors", async () => {
    const error = new Error("Delete failed");
    deleteMock.mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteProject(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync("proj-1")).rejects.toEqual(error);
  });

  it("handles multiple deletions", async () => {
    deleteMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteProject(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync("proj-1");
    await result.current.mutateAsync("proj-2");

    expect(deleteMock).toHaveBeenCalledTimes(2);
    expect(deleteMock).toHaveBeenNthCalledWith(1, "proj-1");
    expect(deleteMock).toHaveBeenNthCalledWith(2, "proj-2");
  });
});
