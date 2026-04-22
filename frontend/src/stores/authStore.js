import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      isHydrated: false,

      // Actions
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      login: (user, token) => {
        set({ user, token, error: null });
        localStorage.setItem('gc4k_token', token);
        localStorage.setItem('gc4k_user', JSON.stringify(user));
      },

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('gc4k_token');
        localStorage.removeItem('gc4k_user');
      },

      hydrate: () => {
        const token = localStorage.getItem('gc4k_token');
        const user = localStorage.getItem('gc4k_user');
        if (token && user) {
          set({ token, user: JSON.parse(user), isHydrated: true });
        } else {
          set({ isHydrated: true });
        }
      },
    }),
    {
      name: 'auth-store',
      storage: localStorage,
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
