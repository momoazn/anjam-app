import { faker } from "@faker-js/faker";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "admin" | "supervisor" | "employee";

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  login: (username: string, role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (username: string, role: UserRole) =>
        set({
          user: {
            id: faker.string.uuid(),
            username,
            role,
          },
        }),
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
