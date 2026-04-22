import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useEnfantAuthStore = create(
  persist(
    (set) => ({
      enfant: null,
      token: null,
      loading: false,
      error: null,
      isHydrated: false,

      // Actions
      setEnfant: (enfant) => set({ enfant }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      login: (enfant, token) => {
        set({ enfant, token, error: null });
        localStorage.setItem('gc4k_enfant_token', token);
        localStorage.setItem('gc4k_enfant', JSON.stringify(enfant));
      },

      logout: () => {
        set({ enfant: null, token: null });
        localStorage.removeItem('gc4k_enfant_token');
        localStorage.removeItem('gc4k_enfant');
      },

      hydrate: () => {
        const token = localStorage.getItem('gc4k_enfant_token');
        const enfant = localStorage.getItem('gc4k_enfant');
        if (token && enfant) {
          set({ token, enfant: JSON.parse(enfant), isHydrated: true });
        } else {
          set({ isHydrated: true });
        }
      },
    }),
    {
      name: 'enfant-auth-store',
      storage: localStorage,
      partialize: (state) => ({ token: state.token, enfant: state.enfant }),
    }
  )
);
