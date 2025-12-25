import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { pb } from "@/lib/pocketbase";
import type {
  OrganizationsResponse,
  UsersResponse,
} from "@/lib/pocketbase-types";

type OrgRole = "owner" | "admin" | "member";

interface OrganizationWithRole {
  organization: OrganizationsResponse;
  role: OrgRole;
  joinedAt: string;
}

interface OrganizationsListItem {
  organization: OrganizationsResponse;
  role: OrgRole;
  joined_at: string;
}

interface OrganizationsListResponse {
  organizations: OrganizationsListItem[];
}

interface AuthState {
  // User authentication
  user: UsersResponse | null;
  isAuthenticated: boolean;

  // Organization context
  currentOrganization: OrganizationsResponse | null;
  currentOrgRole: OrgRole | null;
  userOrganizations: OrganizationWithRole[];

  // Loading states
  isLoading: boolean;
  isLoadingOrgs: boolean;

  // Actions
  login: (user: UsersResponse, token?: string) => void;
  updateUser: (user: UsersResponse) => void;
  setUser: (user: UsersResponse | null) => void;
  setCurrentOrganization: (
    org: OrganizationsResponse | null,
    role: OrgRole | null,
  ) => void;
  fetchUserOrganizations: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  logout: () => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      currentOrganization: null,
      currentOrgRole: null,
      userOrganizations: [],
      isLoading: false,
      isLoadingOrgs: false,

      login: (user) => {
        set({
          user,
          isAuthenticated: true,
        });

        get().fetchUserOrganizations();
      },

      updateUser: (user) => {
        set({ user });
      },

      // Set user after login
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });

        if (user) {
          get().fetchUserOrganizations();
        }
      },

      // Set current organization context
      setCurrentOrganization: (org, role) => {
        set({
          currentOrganization: org,
          currentOrgRole: role,
        });
      },

      // Fetch all organizations the user belongs to
      fetchUserOrganizations: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        set({ isLoadingOrgs: true });

        try {
          const response = (await pb.send("/api/v1/organizations", {
            method: "GET",
          })) as OrganizationsListResponse;

          const orgs: OrganizationWithRole[] = response.organizations.map(
            (item) => ({
              organization: item.organization,
              role: item.role,
              joinedAt: item.joined_at,
            }),
          );

          set({ userOrganizations: orgs });

          const { currentOrganization } = get();
          if (!currentOrganization && orgs.length > 0) {
            set({
              currentOrganization: orgs[0].organization,
              currentOrgRole: orgs[0].role,
            });
          }
        } catch (error) {
          console.error("Failed to fetch organizations:", error);
          set({ userOrganizations: [] });
        } finally {
          set({ isLoadingOrgs: false });
        }
      },

      // Switch to a different organization
      switchOrganization: async (orgId) => {
        const { userOrganizations } = get();

        const orgWithRole = userOrganizations.find(
          (o) => o.organization.id === orgId,
        );

        if (orgWithRole) {
          set({
            currentOrganization: orgWithRole.organization,
            currentOrgRole: orgWithRole.role,
          });
        }
      },

      // Logout
      logout: () => {
        pb.authStore.clear();
        set({
          user: null,
          isAuthenticated: false,
          currentOrganization: null,
          currentOrgRole: null,
          userOrganizations: [],
        });
      },

      // Clear all state
      clear: () => {
        set({
          user: null,
          isAuthenticated: false,
          currentOrganization: null,
          currentOrgRole: null,
          userOrganizations: [],
          isLoading: false,
          isLoadingOrgs: false,
        });
      },
    }),
    {
      name: "anjam-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentOrganization: state.currentOrganization,
        currentOrgRole: state.currentOrgRole,
      }),
    },
  ),
);

export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthIsLoggedIn = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useCurrentOrganization = () =>
  useAuthStore((state) => state.currentOrganization);
export const useCurrentOrgRole = () =>
  useAuthStore((state) => state.currentOrgRole);
export const useAuthRole = () =>
  useAuthStore((state) => state.user?.role ?? null);
export const useUserOrganizations = () =>
  useAuthStore((state) => state.userOrganizations);
export const useAuthLogin = () => useAuthStore((state) => state.login);
export const useAuthUpdateUser = () =>
  useAuthStore((state) => state.updateUser);
export const useAuthSetUser = () => useAuthStore((state) => state.setUser);
export const useAuthSetCurrentOrganization = () =>
  useAuthStore((state) => state.setCurrentOrganization);
export const useAuthFetchOrganizations = () =>
  useAuthStore((state) => state.fetchUserOrganizations);
export const useAuthSwitchOrganization = () =>
  useAuthStore((state) => state.switchOrganization);
export const useAuthLogout = () => useAuthStore((state) => state.logout);
export const useAuthClear = () => useAuthStore((state) => state.clear);

export const useAuthActions = () => {
  const login = useAuthLogin();
  const logout = useAuthLogout();
  const updateUser = useAuthUpdateUser();

  return { login, logout, updateUser };
};
