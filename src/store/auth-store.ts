import { create } from "zustand";
import { persist } from "zustand/middleware";

import { pb } from "@/lib/pocketbase";
import { UsersRecord, UsersRoleOptions } from "@/lib/pocketbase-types";

interface AuthState {
  user: UsersRecord | null;
  token: string | null;
  isLoggedIn: boolean;
  role: UsersRoleOptions | null;
  login: (user: UsersRecord, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "auth-storage",
    },
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
