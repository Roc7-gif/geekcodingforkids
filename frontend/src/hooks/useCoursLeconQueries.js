import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// ─── COURS ────────────────────────────────────────────────────────────────────

/**
 * Récupère tous les cours d'un module
 * @param {string} moduleId
 */
export function useModuleCours(moduleId) {
  return useQuery({
    queryKey: ['cours', moduleId],
    queryFn: async () => {
      const { data } = await api.get(`/cours?moduleId=${moduleId}`);
      return data;
    },
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Récupère le détail d'un cours avec ses leçons (liste sans contenu texte)
 * @param {string} coursId
 */
export function useCoursDetail(coursId) {
  return useQuery({
    queryKey: ['cours-detail', coursId],
    queryFn: async () => {
      const { data } = await api.get(`/cours/${coursId}`);
      return data; // { cours, lecons[] }
    },
    enabled: !!coursId,
    staleTime: 3 * 60 * 1000,
  });
}

// ─── LEÇONS ──────────────────────────────────────────────────────────────────

/**
 * Récupère le détail complet d'une leçon (avec contenu + navigation)
 * @param {string} leconId
 */
export function useLeconDetail(leconId) {
  return useQuery({
    queryKey: ['lecon', leconId],
    queryFn: async () => {
      const { data } = await api.get(`/lecons/${leconId}`);
      return data; // { lecon, completee, precedente, suivante }
    },
    enabled: !!leconId,
    staleTime: 0, // Toujours frais pour la progression
  });
}

// ─── PROGRESSION ─────────────────────────────────────────────────────────────

/**
 * Récupère les IDs de toutes les leçons complétées de l'enfant
 */
export function useMaProgression() {
  return useQuery({
    queryKey: ['ma-progression'],
    queryFn: async () => {
      const { data } = await api.get('/lecons/ma-progression');
      return data; // { completees: string[], total: number }
    },
    staleTime: 0,
  });
}

/**
 * Mutation pour marquer une leçon comme complétée
 */
export function useMarquerLeconComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leconId) => {
      const { data } = await api.patch(`/lecons/${leconId}/progression`);
      return data;
    },
    onSuccess: (_, leconId) => {
      // Invalider les queries concernées pour rafraîchir l'UI
      queryClient.invalidateQueries({ queryKey: ['ma-progression'] });
      queryClient.invalidateQueries({ queryKey: ['lecon', leconId] });
    },
  });
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export function useAdminAllCours(moduleId) {
  return useQuery({
    queryKey: ['admin-cours', moduleId],
    queryFn: async () => {
      const url = moduleId ? `/cours/admin/all?moduleId=${moduleId}` : '/cours/admin/all';
      const { data } = await api.get(url);
      return data;
    },
    staleTime: 0,
  });
}

export function useAdminAllLecons(coursId) {
  return useQuery({
    queryKey: ['admin-lecons', coursId],
    queryFn: async () => {
      const url = coursId ? `/lecons/admin/all?coursId=${coursId}` : '/lecons/admin/all';
      const { data } = await api.get(url);
      return data;
    },
    staleTime: 0,
  });
}

export function useCreateCours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/cours', body).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-cours'] }),
  });
}

export function useUpdateCours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/cours/${id}`, body).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-cours'] }),
  });
}

export function useDeleteCours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/cours/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-cours'] }),
  });
}

export function useCreateLecon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/lecons', body).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-lecons'] }),
  });
}

export function useUpdateLecon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/lecons/${id}`, body).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-lecons'] }),
  });
}

export function useDeleteLecon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/lecons/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-lecons'] }),
  });
}
