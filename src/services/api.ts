import axios from 'axios';

// Konfigurasi API URL yang lebih eksplisit untuk mobile
const getApiBaseURL = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port || '5000';
  
  // Jika ada VITE_API_URL, gunakan itu
  if (import.meta.env.VITE_API_URL) {
    console.log('Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Buat URL penuh berdasarkan lokasi saat ini
  const baseURL = `${protocol}//${hostname}:${port}`;
  console.log('Generated base URL:', baseURL);
  return baseURL;
};

const API_BASE_URL = getApiBaseURL();
const API_URL = API_BASE_URL; // Keep backward compatibility

// Debug logging
console.log('API Configuration:', {
  API_URL,
  baseURL: `${API_URL}/api`,
  hostname: window.location.hostname,
  origin: window.location.origin
});

// Konfigurasi default untuk Axios
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Meningkatkan timeout untuk mobile network
  withCredentials: false, // Set to false untuk menghindari CORS issues
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

// Add user info to requests if needed
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    // Flask backend tidak menggunakan Bearer token, tapi kita bisa menambahkan user info jika diperlukan
    config.headers['X-User-Info'] = user;
  }
  return config;
}, handleNetworkError);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors
    if (!error.response) {
      return handleNetworkError(error);
    }
    
    // If error is 401, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Fungsi login dengan penanganan error yang lebih baik dan retry logic
export const login = async (username: string, password: string, retryCount = 0): Promise<any> => {
  const loginURL = `${API_URL}/api/users/auth/login`;
  console.log(`Attempting login (attempt ${retryCount + 1}) to:`, loginURL);
  
  try {
    // Test konektivitas dulu dengan timeout yang lebih pendek
    try {
      const healthCheck = await axios.get(`${API_URL}/health`, { timeout: 5000 });
      console.log('Health check passed:', healthCheck.status);
    } catch (healthError: any) {
      console.warn('Health check failed, but continuing with login:', healthError.message);
    }
    
    // Lakukan login dengan konfigurasi yang lebih mobile-friendly
    const response = await axios({
      method: 'POST',
      url: loginURL,
      data: { username, password },
      timeout: 15000, // Reduced timeout untuk mobile
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      validateStatus: (status) => status < 500, // Accept 4xx errors
      // Tambahan konfigurasi untuk mobile
      withCredentials: false,
      responseType: 'json',
      maxRedirects: 0, // Prevent redirects
    });
    
    console.log('Login response status:', response.status);
    console.log('Login response data:', response.data);
    
    if (response.status === 200 && response.data.user) {
      const { user } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Login successful:', user);
      return response.data;
    } else if (response.status === 401) {
      throw new Error('Username atau password salah');
    } else {
      throw new Error(`Login failed with status ${response.status}: ${response.data?.error || 'Unknown error'}`);
    }
    
  } catch (error: any) {
    console.error('Login error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      }
    });
    
    // Retry logic untuk network errors
    if ((!error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') && retryCount < 2) {
      console.log(`Retrying login (attempt ${retryCount + 2}) after error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Reduced wait time
      return login(username, password, retryCount + 1);
    }
    
    // Handle specific errors dengan pesan yang lebih jelas
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Koneksi timeout. Periksa jaringan internet dan coba lagi.');
    } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      throw new Error(`Tidak dapat terhubung ke server di ${API_URL}. Periksa koneksi jaringan.`);
    } else if (error.code === 'ERR_CANCELED') {
      throw new Error('Request dibatalkan. Silakan coba lagi.');
    } else if (error.response?.status === 401) {
      throw new Error('Username atau password tidak valid');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Data login tidak valid');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Coba lagi nanti.');
    } else {
      // Fallback error message
      const errorMsg = error.response?.data?.error || error.message || 'Login gagal';
      throw new Error(`Login gagal: ${errorMsg}`);
    }
  }
};

export const refreshToken = async () => {
  // Tidak menggunakan token refresh karena Flask backend tidak memiliki sistem token refresh
  // Sebagai gantinya, kita akan redirect ke login
  throw new Error('Session expired, please login again');
};

export const logout = () => {
  localStorage.removeItem('user');
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