import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import type { Doc } from "@/lib/convex";
import type { OrgFeatures } from "@/lib/mode";
import { getOrgFeatures } from "@/lib/mode";

type OrgRole = "owner" | "member";

interface OrganizationSettings {
  modeSettings?: {
    features?: {
      calendar?: boolean;
    };
  };
}

interface OrganizationWithRole {
  organization: Doc<"organizations">;
  role: OrgRole;
  joinedAt: number;
  onboardingCompleted: boolean;
}

interface AuthState {
  // User authentication
  user: Doc<"users"> | null;
  isAuthenticated: boolean;

  // Organization context
  currentOrganization: Doc<"organizations"> | null;
  currentOrgRole: OrgRole | null;
  userOrganizations: OrganizationWithRole[];

  // Features context (product mode features)
  currentOrgFeatures: OrgFeatures;

  // Loading states
  isLoading: boolean;
  isLoadingOrgs: boolean;

  // Error states
  orgsError: Error | null;

  // Actions
  login: (user: Doc<"users">, token?: string) => void;
  updateUser: (user: Doc<"users">) => void;
  setUser: (user: Doc<"users"> | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setOrganizations: (orgs: OrganizationWithRole[]) => void;
  setCurrentOrganization: (
    org: Doc<"organizations"> | null,
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
        currentOrgFeatures: getOrgFeatures("product"),
        isLoading: false,
        isLoadingOrgs: false,
        orgsError: null,

        login: (user) => {
          set({
            user,
            isAuthenticated: true,
          });
          // Organization fetching is now handled by ConvexAuthStateSync
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
        },

        setAuthLoading: (loading) => {
          set({ isLoading: loading });
        },

        setOrganizations: (orgs) => {
          set({ userOrganizations: orgs, isLoadingOrgs: false });

          // Auto-select first organization if none selected
          const { currentOrganization } = get();
          if (!currentOrganization && orgs.length > 0) {
            const firstOrg = orgs[0].organization;
            const settings = firstOrg.settings as
              | OrganizationSettings
              | undefined;
            const features = getOrgFeatures("product", settings);

            set({
              currentOrganization: firstOrg,
              currentOrgRole: orgs[0].role,
              currentOrgFeatures: features,
            });
          }
        },

        // Set current organization context
        setCurrentOrganization: (org, role) => {
          // Cast settings to the expected type
          const settings = org?.settings as OrganizationSettings | undefined;
          const features = getOrgFeatures("product", settings);

          set({
            currentOrganization: org,
            currentOrgRole: role,
            currentOrgFeatures: features,
          });
        },

        // Deprecated: Now handled by ConvexAuthStateSync
        fetchUserOrganizations: async () => {
          // No-op
          return Promise.resolve();
        },

        // Switch to a different organization
        switchOrganization: async (orgId) => {
          const { userOrganizations } = get();

          const orgWithRole = userOrganizations.find(
            (o) => o.organization._id === orgId,
          );

          if (orgWithRole) {
            // Cast settings to the expected type
            const settings = orgWithRole.organization.settings as
              | OrganizationSettings
              | undefined;
            const features = getOrgFeatures("product", settings);

            set({
              currentOrganization: orgWithRole.organization,
              currentOrgRole: orgWithRole.role,
              currentOrgFeatures: features,
            });
          }
        },

        // Logout
        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
            currentOrganization: null,
            currentOrgRole: null,
            userOrganizations: [],
            currentOrgFeatures: getOrgFeatures("product"),
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
            currentOrgFeatures: getOrgFeatures("product"),
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
          const settings = currentOrg?.settings as
            | OrganizationSettings
            | undefined;

          return {
            ...merged,
            currentOrgFeatures: getOrgFeatures("product", settings),
          };
        },
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          currentOrganization: state.currentOrganization,
          currentOrgRole: state.currentOrgRole,
          userOrganizations: state.userOrganizations,
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
      (o) => o.organization._id === currentOrg._id,
    );
    return orgWithRole?.onboardingCompleted ?? true;
  });
export const useAuthRole = () =>
  useAuthStore((state) => (state.user ? "admin" : null)); // Default role for now
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

export const useCurrentOrgFeatures = () =>
  useAuthStore((state) => state.currentOrgFeatures);
export const useAuthOrgsError = () => useAuthStore((state) => state.orgsError);

// Deprecated: Always returns "product" since we only support product mode now
export const useCurrentOrgMode = () => "product" as const;
