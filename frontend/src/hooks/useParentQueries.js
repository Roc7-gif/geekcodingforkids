import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { useEnfantAuthStore } from '../stores/enfantAuthStore';

// ========== QUERIES ==========

// Récupérer le profil parent
export const useParentMe = () => {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['parent', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
    enabled: !!token,
  });
};

// Récupérer tous les modules
export const useModules = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data } = await api.get('/modules');
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 min
  });
};

// Récupérer un module par ID
export const useModule = (id) => {
  return useQuery({
    queryKey: ['module', id],
    queryFn: async () => {
      const { data } = await api.get(`/modules/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

// Récupérer mes inscriptions
export const useMyInscriptions = () => {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['inscriptions', 'mes-inscriptions'],
    queryFn: async () => {
      const { data } = await api.get('/inscriptions/mes-inscriptions');
      return data;
    },
    enabled: !!token,
  });
};

// Admin: Toutes les inscriptions
export const useAllInscriptions = (statut = null, page = 1) => {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['inscriptions', 'all', statut, page],
    queryFn: async () => {
      const params = { page };
      if (statut) params.statut = statut;
      const { data } = await api.get('/inscriptions', { params });
      return data;
    },
    enabled: !!token,
  });
};

// Admin: Statistiques
export const useInscriptionStats = () => {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['inscriptions', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/inscriptions/stats/overview');
      return data;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 min
  });
};

// ========== MUTATIONS ==========

// Login parent
export const useLoginParent = () => {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await api.post('/auth/login', { email, password });
      return data;
    },
    onSuccess: (data) => {
      // Clear any existing enfant session
      useEnfantAuthStore.getState().logout();
      authStore.login(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['parent'] });
    },
  });
};

// Login google parent
export const useGoogleLoginParent = () => {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: async (tokenId) => {
      const { data } = await api.post('/auth/google', { tokenId });
      return data;
    },
    onSuccess: (data) => {
      useEnfantAuthStore.getState().logout();
      authStore.login(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['parent'] });
    },
  });
};

// Register parent
export const useRegisterParent = () => {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post('/auth/register', formData);
      return data;
    },
    onSuccess: (data) => {
      // Clear any existing enfant session
      useEnfantAuthStore.getState().logout();
      authStore.login(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['parent'] });
    },
  });
};

// Créer une inscription
export const useCreateInscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inscriptionData) => {
      const { data } = await api.post('/inscriptions', inscriptionData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscriptions'] });
    },
  });
};

// Admin: Changer statut inscription
export const useUpdateInscriptionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inscriptionId, statut }) => {
      const { data } = await api.put(`/inscriptions/${inscriptionId}/statut`, { statut });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscriptions'] });
    },
  });
};

// Envoyer un message contact
export const useSendContact = () => {
  return useMutation({
    mutationFn: async (contactData) => {
      const { data } = await api.post('/contact', contactData);
      return data;
    },
  });
};

// Admin: Récupérer tous les messages
export const useAllContacts = () => {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['contacts', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/contact');
      return data;
    },
    enabled: !!token,
  });
};

// Admin: Changer statut contact
export const useUpdateContactStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, statut }) => {
      const { data } = await api.put(`/contact/${contactId}/statut`, { statut });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};
