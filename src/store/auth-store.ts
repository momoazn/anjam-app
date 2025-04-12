import { create } from "zustand";
import { persist } from "zustand/middleware";

import { pb } from "@/lib/pocketbase";
import { UsersRecord } from "@/lib/pocketbase-types";

interface AuthState {
  user: UsersRecord | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (user: UsersRecord, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      login(user: UsersRecord, token: string) {
        set({
          user: user,
          token: token,
          isLoggedIn: true,
        });
      },
      logout() {
        set({ user: null, token: null, isLoggedIn: false });
        pb.authStore.clear();
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
