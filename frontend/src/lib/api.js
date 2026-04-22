import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Injecter token JWT automatiquement (parent prioritaire sur enfant)
api.interceptors.request.use((config) => {
  // Le token parent est toujours prioritaire (admin, parent)
  const parentToken = localStorage.getItem('gc4k_token');
  // Token enfant uniquement sur les routes /enfant/*
  const enfantToken = localStorage.getItem('gc4k_enfant_token');

  const isEnfantRoute = config.url?.includes('/enfant');
  const token = isEnfantRoute
    ? (enfantToken || parentToken)
    : (parentToken || enfantToken);

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gérer les erreurs globalement
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Nettoyer les tokens
      localStorage.removeItem('gc4k_token');
      localStorage.removeItem('gc4k_user');
      localStorage.removeItem('gc4k_enfant_token');
      localStorage.removeItem('gc4k_enfant');
      
      // Rediriger vers login parent ou enfant selon le token
      const isEnfantPage = window.location.pathname.includes('/enfant');
      window.location.replace(isEnfantPage ? '/enfant/login' : '/login');
    }
    return Promise.reject(err);
  }
);

export default api;
