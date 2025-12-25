import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarState = {
  starredProjectIds: string[];
  toggleStar: (projectId: string) => void;
  isStarred: (projectId: string) => boolean;
};

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      starredProjectIds: [],
      toggleStar(projectId: string) {
        const { starredProjectIds } = get();
        const isCurrentlyStarred = starredProjectIds.includes(projectId);
        set({
          starredProjectIds: isCurrentlyStarred
            ? starredProjectIds.filter((id) => id !== projectId)
            : [...starredProjectIds, projectId],
        });
      },
      isStarred(projectId: string) {
        return get().starredProjectIds.includes(projectId);
      },
    }),
    {
      name: "sidebar-storage",
    },
  ),
);

// Optimized selectors
export const useStarredProjects = () =>
  useSidebarStore((state) => state.starredProjectIds);
export const useSidebarActions = () => {
  const toggleStar = useSidebarStore((state) => state.toggleStar);
  const isStarred = useSidebarStore((state) => state.isStarred);

  return { toggleStar, isStarred };
};
