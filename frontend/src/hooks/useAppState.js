// Hook personnalisé pour combiner les stores et requêtes
import { useAuthStore } from '../stores/authStore';
import { useEnfantAuthStore } from '../stores/enfantAuthStore';

export const useAppState = () => {
  const authStore = useAuthStore();
  const enfantAuthStore = useEnfantAuthStore();

  return {
    // Parent auth
    parentToken: authStore.token,
    parentUser: authStore.user,
    setParentToken: authStore.setToken,
    setParentUser: authStore.setUser,
    loginParent: authStore.login,
    logoutParent: authStore.logout,

    // Enfant auth
    enfantToken: enfantAuthStore.token,
    enfant: enfantAuthStore.enfant,
    setEnfantToken: enfantAuthStore.setToken,
    setEnfant: enfantAuthStore.setEnfant,
    loginEnfant: enfantAuthStore.login,
    logoutEnfant: enfantAuthStore.logout,

    // Helpers
    isParentLoggedIn: !!authStore.token,
    isEnfantLoggedIn: !!enfantAuthStore.token,
    isParentAdmin: authStore.user?.role === 'admin',
  };
};
