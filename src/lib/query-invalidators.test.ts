import { describe, expect, it, vi } from "vitest";

import { queryKeys } from "@/hooks/query-keys";
import { mutationInvalidators } from "./query-invalidators";

describe("mutationInvalidators.crud", () => {
  it("invalidates task create presets", () => {
    const client = {
      invalidateQueries: vi.fn(),
    } as unknown as { invalidateQueries: (args: unknown) => void };

    mutationInvalidators.crud.tasks.create(client as never);

    expect(client.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.tasks.all,
    });
  });
});
