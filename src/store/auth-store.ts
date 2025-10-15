import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

import { pb } from "@/lib/pocketbase";
import { UsersRecord, UsersRoleOptions } from "@/lib/pocketbase-types";

interface AuthState {
  user: UsersRecord | null;
  token: string | null;
  isLoggedIn: boolean;
  role: UsersRoleOptions | null;
  login: (user: UsersRecord, token: string) => void;
  logout: () => void;
  // Selectors for optimized subscriptions
  getIsLoggedIn: () => boolean;
  getUser: () => UsersRecord | null;
  getRole: () => UsersRoleOptions | null;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isLoggedIn: false,
        role: null,
        login(user: UsersRecord, token: string) {
          set({
            user: user,
            token: token,
            isLoggedIn: true,
            role: user.role,
          });
        },
        logout() {
          set({ user: null, token: null, isLoggedIn: false, role: null });
          pb.authStore.clear();
        },
        // Optimized selectors
        getIsLoggedIn: () => get().isLoggedIn,
        getUser: () => get().user,
        getRole: () => get().role,
      }),
      {
        name: "auth-storage",
        // Optimize persistence with partialize
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isLoggedIn: state.isLoggedIn,
          role: state.role,
        }),
        // Add version for migration handling
        version: 1,
      },
    ),
  ),
);

// Optimized selectors to prevent unnecessary re-renders
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useAuthIsLoggedIn = () =>
  useAuthStore((state) => state.isLoggedIn);
export const useAuthRole = () => useAuthStore((state) => state.role);
export const useAuthActions = () =>
  useAuthStore((state) => ({
    login: state.login,
    logout: state.logout,
  }));
