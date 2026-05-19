import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types';
import { login as apiLogin, logout as apiLogout } from '../services/authService';

export interface ActiveBranch {
  id: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  activeBranch: ActiveBranch | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setActiveBranch: (branch: ActiveBranch | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      activeBranch: null,

      login: async (email, password) => {
        const { user, accessToken, refreshToken } = await apiLogin(email, password);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      logout: async () => {
        await apiLogout();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, activeBranch: null });
      },

      setUser: (user) => set({ user }),

      setSession: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      setActiveBranch: (branch) => set({ activeBranch: branch }),
    }),
    {
      name: 'edustack_auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
