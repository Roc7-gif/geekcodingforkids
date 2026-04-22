import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useEnfantAuthStore } from '../stores/enfantAuthStore';
import { useAuthStore } from '../stores/authStore';

// ========== QUERIES ==========

// Récupérer le profil enfant
export const useEnfantMe = () => {
  const token = useEnfantAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['enfant', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/enfant/me');
      return data;
    },
    enabled: !!token,
  });
};

// Récupérer l'inscription de l'enfant
export const useEnfantInscription = () => {
  const token = useEnfantAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['enfant', 'inscription'],
    queryFn: async () => {
      const { data } = await api.get('/enfant/mon-inscription');
      return data;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
};

// ========== MUTATIONS ==========

// Login enfant
export const useLoginEnfant = () => {
  const queryClient = useQueryClient();
  const enfantAuthStore = useEnfantAuthStore();

  return useMutation({
    mutationFn: async ({ username, password }) => {
      const { data } = await api.post('/enfant/login', { username, password });
      return data;
    },
    onSuccess: (data) => {
      // Clear any existing parent session
      useAuthStore.getState().logout();
      enfantAuthStore.login(data.enfant, data.token);
      queryClient.invalidateQueries({ queryKey: ['enfant'] });
    },
  });
};

// Mettre à jour la progression
export const useUpdateProgression = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (progression) => {
      const { data } = await api.put('/enfant/progression', { progression });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enfant', 'me'] });
    },
  });
};
