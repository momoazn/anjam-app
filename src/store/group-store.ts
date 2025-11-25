import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { GroupsResponse } from "@/lib/pocketbase-types";

type GroupState = {
  currentGroup: GroupsResponse | null;
  setCurrentGroup: (group: GroupsResponse | null) => void;
  clearGroup: () => void;
};

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      currentGroup: null,
      setCurrentGroup(group: GroupsResponse | null) {
        set({ currentGroup: group });
      },
      clearGroup() {
        set({ currentGroup: null });
      },
    }),
    {
      name: "group-storage",
    },
  ),
);

// Optimized selectors to prevent unnecessary re-renders
export const useCurrentGroup = () =>
  useGroupStore((state) => state.currentGroup);
export const useSetCurrentGroup = () =>
  useGroupStore((state) => state.setCurrentGroup);
export const useClearGroup = () => useGroupStore((state) => state.clearGroup);
