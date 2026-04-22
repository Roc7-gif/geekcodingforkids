import { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useEnfantAuthStore } from '../stores/enfantAuthStore';
import { useLoginParent, useRegisterParent, useParentMe, useGoogleLoginParent } from '../hooks/useParentQueries';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const store = useAuthStore();
  const { data: user, isLoading: loading } = useParentMe();
  
  useEffect(() => {
    store.hydrate();
  }, []);

  const login = useLoginParent();
  const register = useRegisterParent();
  const loginGoogle = useGoogleLoginParent();

  const logout = () => {
    store.logout();
    useEnfantAuthStore.getState().logout();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user: user || store.user,
      loading: loading || !store.isHydrated,
      isHydrated: store.isHydrated,
      login: login.mutateAsync,
      register: register.mutateAsync,
      loginGoogle: loginGoogle.mutateAsync,
      logout,
      isAdmin: user?.role === 'admin' || store.user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
