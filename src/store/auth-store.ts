import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { logError } from "@/lib/logger";
import type { OrgFeatures, OrgMode } from "@/lib/mode";
import { getConfiguredOrgMode, getOrgFeatures } from "@/lib/mode";
import { pb } from "@/lib/pocketbase";
import type {
  OrganizationsResponse,
  UsersResponse,
} from "@/lib/pocketbase-types";

type OrgRole = "owner" | "admin" | "member";

interface OrganizationSettings {
  modeSettings?: {
    features?: {
      calendar?: boolean;
    };
  };
}

interface OrganizationWithRole {
  organization: OrganizationsResponse;
  role: OrgRole;
  joinedAt: string;
  onboardingCompleted: boolean;
}

interface OrganizationsListItem {
  organization: OrganizationsResponse;
  role: OrgRole;
  joined_at: string;
  onboarding_completed: boolean;
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

  // Mode context (NEW)
  currentOrgMode: OrgMode | null;
  currentOrgFeatures: OrgFeatures;

  // Loading states
  isLoading: boolean;
  isLoadingOrgs: boolean;

  // Error states
  orgsError: Error | null;

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
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        currentOrganization: null,
        currentOrgRole: null,
        userOrganizations: [],
        currentOrgMode: null, // NEW
        currentOrgFeatures: getOrgFeatures(undefined), // NEW
        isLoading: false,
        isLoadingOrgs: false,
        orgsError: null,

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
          // Use build-time configured mode instead of reading from org record
          const mode = getConfiguredOrgMode();
          // Cast settings to the expected type
          const settings = org?.settings as OrganizationSettings | undefined;
          const features = getOrgFeatures(mode ?? "operations", settings);

          set({
            currentOrganization: org,
            currentOrgRole: role,
            currentOrgMode: mode,
            currentOrgFeatures: features,
          });
        },

        // Fetch all organizations the user belongs to
        fetchUserOrganizations: async () => {
          const { isAuthenticated } = get();
          if (!isAuthenticated) return;

          set({ isLoadingOrgs: true, orgsError: null });

          try {
            const response = (await pb.send("/api/v1/organizations", {
              method: "GET",
            })) as OrganizationsListResponse;

            const orgs: OrganizationWithRole[] = response.organizations.map(
              (item) => ({
                organization: item.organization,
                role: item.role,
                joinedAt: item.joined_at,
                onboardingCompleted: item.onboarding_completed,
              }),
            );

            set({ userOrganizations: orgs });

            const { currentOrganization } = get();
            if (!currentOrganization && orgs.length > 0) {
              const firstOrg = orgs[0].organization;
              // Use build-time configured mode instead of reading from org record
              const mode = getConfiguredOrgMode();
              // Cast settings to the expected type
              const settings = firstOrg.settings as
                | OrganizationSettings
                | undefined;
              const features = getOrgFeatures(mode ?? "operations", settings);

              set({
                currentOrganization: firstOrg,
                currentOrgRole: orgs[0].role,
                currentOrgMode: mode,
                currentOrgFeatures: features,
              });
            }
          } catch (error) {
            logError("Failed to fetch organizations", error);
            set({ userOrganizations: [], orgsError: error as Error });
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
            // Use build-time configured mode instead of reading from org record
            const mode = getConfiguredOrgMode();
            // Cast settings to the expected type
            const settings = orgWithRole.organization.settings as
              | OrganizationSettings
              | undefined;
            const features = getOrgFeatures(mode ?? "operations", settings);

            set({
              currentOrganization: orgWithRole.organization,
              currentOrgRole: orgWithRole.role,
              currentOrgMode: mode,
              currentOrgFeatures: features,
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
            currentOrgMode: null,
            currentOrgFeatures: getOrgFeatures(undefined),
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
            currentOrgMode: null,
            currentOrgFeatures: getOrgFeatures(undefined),
            isLoading: false,
            isLoadingOrgs: false,
            orgsError: null,
          });
        },
      }),
      {
        name: "anjam-auth-storage",
        storage: createJSONStorage(() => localStorage),
        merge: (persistedState, currentState) => {
          const merged = {
            ...currentState,
            ...(persistedState as Partial<AuthState>),
          };

          const currentOrg = merged.currentOrganization ?? null;
          // Use build-time configured mode instead of reading from org record
          const mode = getConfiguredOrgMode();
          const settings = currentOrg?.settings as
            | OrganizationSettings
            | undefined;

          return {
            ...merged,
            currentOrgMode: mode,
            currentOrgFeatures: getOrgFeatures(mode ?? "operations", settings),
          };
        },
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          currentOrganization: state.currentOrganization,
          currentOrgRole: state.currentOrgRole,
          userOrganizations: state.userOrganizations,
          currentOrgMode: state.currentOrgMode,
          currentOrgFeatures: state.currentOrgFeatures,
        }),
      },
    ),
    { name: "auth-store", enabled: import.meta.env.DEV },
  ),
);

export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useCurrentOrganization = () =>
  useAuthStore((state) => state.currentOrganization);
export const useCurrentOrgRole = () =>
  useAuthStore((state) => state.currentOrgRole);
export const useCurrentOrgOnboardingCompleted = () =>
  useAuthStore((state) => {
    const currentOrg = state.currentOrganization;
    if (!currentOrg) return true; // No org, consider onboarding as complete
    const orgWithRole = state.userOrganizations.find(
      (o) => o.organization.id === currentOrg.id,
    );
    return orgWithRole?.onboardingCompleted ?? true;
  });
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

export const useAuthActions = () =>
  useAuthStore(
    useShallow((state) => ({
      login: state.login,
      logout: state.logout,
      updateUser: state.updateUser,
    })),
  );

export const useCurrentOrgMode = () =>
  useAuthStore((state) => state.currentOrgMode);
export const useCurrentOrgFeatures = () =>
  useAuthStore((state) => state.currentOrgFeatures);
export const useAuthOrgsError = () => useAuthStore((state) => state.orgsError);
