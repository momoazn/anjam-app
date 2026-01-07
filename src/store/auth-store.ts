import { useConvexAuth } from "convex/react";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import type { Doc } from "@/lib/convex";
import type { OrgFeatures } from "@/lib/mode";
import { getOrgFeatures } from "@/lib/mode";

type OrgRole = "owner" | "member";

interface OrganizationWithRole {
  organization: Doc<"organizations">;
  role: OrgRole;
  joinedAt: number;
  onboardingCompleted: boolean;
}

interface AuthState {
  user: Doc<"users"> | null;
  isAuthenticated: boolean;
  currentOrganization: Doc<"organizations"> | null;
  currentOrgRole: OrgRole | null;
  userOrganizations: OrganizationWithRole[];
  currentOrgFeatures: OrgFeatures;
  isLoading: boolean;
  isLoadingOrgs: boolean;
  orgsError: Error | null;
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
        user: null,
        isAuthenticated: false,
        currentOrganization: null,
        currentOrgRole: null,
        userOrganizations: [],
        currentOrgFeatures: getOrgFeatures(),
        isLoading: false,
        isLoadingOrgs: false,
        orgsError: null,

        login: (user) => {
          set({
            user,
            isAuthenticated: true,
          });
        },

        updateUser: (user) => {
          set({ user });
        },

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

          const { currentOrganization } = get();
          if (!currentOrganization && orgs.length > 0) {
            const firstOrg = orgs[0].organization;
            const features = getOrgFeatures();

            set({
              currentOrganization: firstOrg,
              currentOrgRole: orgs[0].role,
              currentOrgFeatures: features,
            });
          }
        },

        setCurrentOrganization: (org, role) => {
          const features = getOrgFeatures();

          set({
            currentOrganization: org,
            currentOrgRole: role,
            currentOrgFeatures: features,
          });
        },

        fetchUserOrganizations: async () => {
          return Promise.resolve();
        },

        switchOrganization: async (orgId) => {
          const { userOrganizations } = get();

          const orgWithRole = userOrganizations.find(
            (o) => o.organization._id === orgId,
          );

          if (orgWithRole) {
            const features = getOrgFeatures();

            set({
              currentOrganization: orgWithRole.organization,
              currentOrgRole: orgWithRole.role,
              currentOrgFeatures: features,
            });
          }
        },

        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
            currentOrganization: null,
            currentOrgRole: null,
            userOrganizations: [],
            currentOrgFeatures: getOrgFeatures(),
          });
        },

        clear: () => {
          set({
            user: null,
            isAuthenticated: false,
            currentOrganization: null,
            currentOrgRole: null,
            userOrganizations: [],
            currentOrgFeatures: getOrgFeatures(),
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

          return {
            ...merged,
            currentOrgFeatures: getOrgFeatures(),
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
export const useAuthIsAuthenticated = () => {
  // Prefer Convex auth as source of truth; fallback to persisted state while Convex loads.
  // This avoids incorrect redirects if the auth-store user sync lags behind.
  const { isAuthenticated, isLoading } = useConvexAuth();
  const persisted = useAuthStore((state) => state.isAuthenticated);
  return isLoading ? persisted : isAuthenticated;
};
export const useCurrentOrganization = () =>
  useAuthStore((state) => state.currentOrganization);
export const useCurrentOrgRole = () =>
  useAuthStore((state) => state.currentOrgRole);
export const useCurrentOrgOnboardingCompleted = () =>
  useAuthStore((state) => {
    const currentOrg = state.currentOrganization;
    if (!currentOrg) return true;
    const orgWithRole = state.userOrganizations.find(
      (o) => o.organization._id === currentOrg._id,
    );
    return orgWithRole?.onboardingCompleted ?? true;
  });
export const useAuthRole = () =>
  useAuthStore((state) => (state.user ? "admin" : null));
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
