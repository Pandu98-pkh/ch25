import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Konfigurasi default untuk Axios
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
  },
  timeout: 15000, // Meningkatkan timeout menjadi 15 detik
});

// Konfigurasi penanganan kesalahan jaringan
const handleNetworkError = (error: any) => {
  if (error.code === 'ECONNABORTED') {
    console.error('Request timeout:', error);
    throw new Error('Permintaan kehabisan waktu. Silakan coba lagi.');
  } else if (error.code === 'ERR_NETWORK') {
    console.error('Network error (server mungkin offline):', error);
    throw new Error('Tidak dapat terhubung ke server. Periksa koneksi jaringan Anda.');
  } else if (error.code === 'ERR_CANCELED') {
    console.error('Request canceled:', error);
    throw new Error('Permintaan dibatalkan.');
  } else {
    console.error('API request error:', error);
    throw error;
  }
};

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, handleNetworkError);

// Handle auth errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      return handleNetworkError(error);
    }
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken
          }, { timeout: 10000 }); // Meningkatkan timeout untuk refresh request
          
          const { access } = response.data;
          localStorage.setItem('token', access);
          
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    // If error is still 401 after refresh attempt, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Fungsi login dengan penanganan error yang lebih baik
export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/token/`, 
      { username, password },
      { timeout: 10000 } // Konsisten dengan timeout API lainnya
    );
    const { access, refresh } = response.data;
    localStorage.setItem('token', access);
    localStorage.setItem('refresh_token', refresh);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    return response.data;
  } catch (error: any) {
    // Handle network errors specifically
    if (!error.response) {
      console.error('Login error - network issue:', error.message);
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi jaringan Anda.');
    }
    
    // Handle authentication errors
    if (error.response.status === 401) {
      throw new Error('Username atau password tidak valid');
    }
    
    // Handle other errors
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token');
  
  try {
    const response = await axios.post(`${API_URL}/token/refresh/`, { refresh });
    const { access } = response.data;
    localStorage.setItem('token', access);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    return access;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  delete api.defaults.headers.common['Authorization'];
  window.location.href = '/login';
};

// Utility functions for request handling
export const createAbortController = (timeoutMs = 15000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  return {
    controller,
    signal: controller.signal,
    clearTimeout: () => clearTimeout(timeoutId)
  };
};

export default api;