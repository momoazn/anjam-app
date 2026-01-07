import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { authClient } from "@/lib/auth-client";
import type { Doc } from "@/lib/convex";

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
  isLoading: boolean;
  isLoadingOrgs: boolean;
  orgsError: Error | null;
  login: (user: Doc<"users">, token?: string) => void;
  updateUser: (user: Doc<"users">) => void;
  setUser: (user: Doc<"users"> | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setOrganizations: (orgs: OrganizationWithRole[]) => void;
  setOrganizationsLoading: (loading: boolean) => void;
  setCurrentOrganization: (
    org: Doc<"organizations"> | null,
    role: OrgRole | null,
  ) => void;
  fetchUserOrganizations: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  logout: () => void;
  clear: () => void;
}

const STORAGE_KEY = "anjam-auth-storage";

const initialState = {
  user: null,
  isAuthenticated: false,
  currentOrganization: null,
  currentOrgRole: null,
  userOrganizations: [],
  isLoading: false,
  isLoadingOrgs: false,
  orgsError: null,
} satisfies Omit<
  AuthState,
  | "login"
  | "updateUser"
  | "setUser"
  | "setAuthLoading"
  | "setOrganizations"
  | "setOrganizationsLoading"
  | "setCurrentOrganization"
  | "fetchUserOrganizations"
  | "switchOrganization"
  | "logout"
  | "clear"
>;

const selectOrgState = (orgs: OrganizationWithRole[]) => {
  if (orgs.length === 0) {
    return {
      currentOrganization: null,
      currentOrgRole: null,
    };
  }
  return {
    currentOrganization: orgs[0].organization,
    currentOrgRole: orgs[0].role,
  };
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

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
          const { currentOrganization } = get();
          set({
            userOrganizations: orgs,
            isLoadingOrgs: false,
            ...(currentOrganization ? {} : selectOrgState(orgs)),
          });
        },

        setOrganizationsLoading: (loading) => {
          set({ isLoadingOrgs: loading });
        },

        setCurrentOrganization: (org, role) => {
          set({
            currentOrganization: org,
            currentOrgRole: role,
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
            set({
              currentOrganization: orgWithRole.organization,
              currentOrgRole: orgWithRole.role,
            });
          }
        },

        logout: () => {
          set({
            ...initialState,
          });
        },

        clear: () => {
          set({ ...initialState });
        },
      }),
      {
        name: STORAGE_KEY,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          currentOrganization: state.currentOrganization,
          currentOrgRole: state.currentOrgRole,
          userOrganizations: state.userOrganizations,
        }),
      },
    ),
    { name: "auth-store", enabled: import.meta.env.DEV },
  ),
);

export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthIsAuthenticated = () => {
  // Prefer Better Auth session as source of truth; fallback to persisted state while it loads.
  // This avoids incorrect redirects if the auth-store user sync lags behind.
  const { data: session, isPending } = authClient.useSession();
  const persisted = useAuthStore((state) => state.isAuthenticated);
  const isAuthenticated = Boolean(session?.user);
  return isPending ? persisted : isAuthenticated;
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

export const useAuthOrgsError = () => useAuthStore((state) => state.orgsError);
