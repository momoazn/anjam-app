import { beforeEach, describe, expect, it } from "vitest";

import { useAuthStore } from "./app-context-store";

const org = (id: string) =>
  ({ _id: id, name: id }) as unknown as Parameters<
    ReturnType<typeof useAuthStore.getState>["setCurrentOrganization"]
  >[0];
const entry = (id: string) => ({
  organization: org(id)!,
  role: "member" as const,
  joinedAt: 0,
  onboardingCompleted: true,
});

describe("auth store org persistence", () => {
  beforeEach(() => useAuthStore.getState().clear());

  it("drops a persisted org the user no longer belongs to", () => {
    const s = useAuthStore.getState();
    s.setCurrentOrganization(org("old"), "owner");
    s.setOrganizations([entry("a"), entry("b")]);
    expect(useAuthStore.getState().currentOrganization?._id).toBe("a");
    expect(useAuthStore.getState().currentOrgRole).toBe("member");
  });

  it("keeps the current org when still a member", () => {
    const s = useAuthStore.getState();
    s.setCurrentOrganization(org("b"), "member");
    s.setOrganizations([entry("a"), entry("b")]);
    expect(useAuthStore.getState().currentOrganization?._id).toBe("b");
  });

  it("clears org state on sign-out", () => {
    const s = useAuthStore.getState();
    s.setOrganizations([entry("a")]);
    s.setUser(null);
    expect(useAuthStore.getState().currentOrganization).toBeNull();
    expect(useAuthStore.getState().userOrganizations).toEqual([]);
  });
});
