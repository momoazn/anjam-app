import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'supervisor' | 'employee';

interface User {
  username: string;
  role: UserRole;
  lastActive: number;
}

interface AuthState {
  user: User | null;
  login: (username: string, role: UserRole) => void;
  logout: () => void;
  updateLastActive: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (username: string, role: UserRole) =>
        set({
          user: {
            username,
            role,
            lastActive: Date.now(),
          },
        }),
      logout: () => set({ user: null }),
      updateLastActive: () =>
        set((state) => ({
          user: state.user
            ? { ...state.user, lastActive: Date.now() }
            : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
); 