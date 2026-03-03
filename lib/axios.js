// lib/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://violet-bison-661615.hostingersite.com/api',
  withCredentials: true, // <--- required if using cookie auth (Sanctum)
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('yarvest_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors (unauthorized, CSRF, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle CSRF token mismatch (419)
    if (error.response?.status === 419) {
      console.error('CSRF token mismatch. This should not happen with Bearer token authentication.');
      // For API routes using Bearer tokens, CSRF errors shouldn't occur
      // If they do, it's a backend configuration issue
    }
    
    // Handle 401 errors (unauthorized) - logout user
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('yarvest_auth_token');
        localStorage.removeItem('yarvest_current_user');
        localStorage.removeItem('auth-storage');

        // Update Zustand auth store (dynamic import to avoid circular dependency)
        import('../stores/auth-store').then(({ useAuthStore }) => {
          useAuthStore.setState({ user: null, isLoggedIn: false });
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
