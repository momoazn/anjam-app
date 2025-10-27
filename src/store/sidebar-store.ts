import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarState = {
  starredProjectIds: string[];
  collapsedGroupIds: Record<string, boolean>;
  toggleStar: (projectId: string) => void;
  toggleGroup: (groupId: string) => void;
  isStarred: (projectId: string) => boolean;
  isCollapsed: (groupId: string) => boolean;
};

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      starredProjectIds: [],
      collapsedGroupIds: {},
      toggleStar(projectId: string) {
        const { starredProjectIds } = get();
        const isCurrentlyStarred = starredProjectIds.includes(projectId);
        set({
          starredProjectIds: isCurrentlyStarred
            ? starredProjectIds.filter((id) => id !== projectId)
            : [...starredProjectIds, projectId],
        });
      },
      toggleGroup(groupId: string) {
        const { collapsedGroupIds } = get();
        set({
          collapsedGroupIds: {
            ...collapsedGroupIds,
            [groupId]: !collapsedGroupIds[groupId],
          },
        });
      },
      isStarred(projectId: string) {
        return get().starredProjectIds.includes(projectId);
      },
      isCollapsed(groupId: string) {
        return get().collapsedGroupIds[groupId] ?? false;
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
export const useCollapsedGroups = () =>
  useSidebarStore((state) => state.collapsedGroupIds);
export const useSidebarActions = () => {
  const toggleStar = useSidebarStore((state) => state.toggleStar);
  const toggleGroup = useSidebarStore((state) => state.toggleGroup);
  const isStarred = useSidebarStore((state) => state.isStarred);
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  return { toggleStar, toggleGroup, isStarred, isCollapsed };
};
