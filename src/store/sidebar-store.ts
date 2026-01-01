import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

type SidebarState = {
  starredProjectIds: string[];
  toggleStar: (projectId: string) => void;
  isStarred: (projectId: string) => boolean;
};

export const useSidebarStore = create<SidebarState>()(
  devtools(
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
    { name: "sidebar-store", enabled: import.meta.env.DEV },
  ),
);

// Optimized selectors
export const useStarredProjects = () =>
  useSidebarStore((state) => state.starredProjectIds);
export const useSidebarActions = () =>
  useSidebarStore(
    useShallow((state) => ({
      toggleStar: state.toggleStar,
      isStarred: state.isStarred,
    })),
  );
