import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { useBulkDeleteTasks, useTasks } from "./tasks";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getListMock = vi.fn();
const getFullListMock = vi.fn();
const updateMock = vi.fn();
const collectionMock = vi.fn(() => ({
  getList: getListMock,
  getFullList: getFullListMock,
  update: updateMock,
  delete: vi.fn(),
}));

vi.mock("../lib/pocketbase", () => ({
  pb: {
    collection: collectionMock,
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

describe("useTasks pagination", () => {
  beforeEach(() => {
    getListMock.mockReset();
    getFullListMock.mockReset();
    collectionMock.mockClear();
  });

  it("returns paginated metadata from PocketBase", async () => {
    getListMock.mockResolvedValue({
      items: [
        {
          id: "task-1",
          title: "Task 1",
          status: "todo",
          project: "project-1",
          deleted_at: "",
        },
      ],
      page: 2,
      perPage: 25,
      totalItems: 60,
      totalPages: 3,
    });

    const { result } = renderHook(
      () =>
        useTasks({
          page: 2,
          perPage: 25,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getListMock).toHaveBeenCalledWith(
      2,
      25,
      expect.objectContaining({
        filter: expect.any(String),
      }),
    );
    expect(result.current.data?.page).toBe(2);
    expect(result.current.data?.perPage).toBe(25);
    expect(result.current.data?.totalPages).toBe(3);
    expect(result.current.data?.items).toHaveLength(1);
  });
});

describe("useBulkDeleteTasks", () => {
  beforeEach(() => {
    updateMock.mockReset();
  });

  it("soft deletes tasks by setting deleted_at", async () => {
    updateMock.mockResolvedValue({});

    const { result } = renderHook(() => useBulkDeleteTasks(), {
      wrapper: createWrapper(),
    });

    const now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);

    await result.current.mutateAsync(["a", "b"]);

    vi.useRealTimers();

    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledWith("a", {
      deleted_at: new Date(now).toISOString(),
    });
    expect(updateMock).toHaveBeenCalledWith("b", {
      deleted_at: new Date(now).toISOString(),
    });
  });
});
