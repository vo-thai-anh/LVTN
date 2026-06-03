import axios from 'axios';

// 1. Instance cho Laravel (User)
const envUserUrl = import.meta.env.VITE_API_USER_URL || import.meta.env.VITE_USER_API_URL || import.meta.env.VITE_API_BASE_URL;
const userBaseURL = (envUserUrl || '/api-user').replace(/\/+$/, '');
export const userAxios = axios.create({
  baseURL: userBaseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 2. Instance cho Admin (Laravel API)
const envAdminUrl = import.meta.env.VITE_API_ADMIN_URL || import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_BASE_URL;
const adminBaseURL = (envAdminUrl || '/api-admin').replace(/\/+$/, '');
export const adminAxios = axios.create({
  baseURL: adminBaseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});


// Request Interceptor: Gắn token
const setupRequestInterceptor = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

setupRequestInterceptor(userAxios);
setupRequestInterceptor(adminAxios);

// Response Interceptor: Xử lý lỗi tập trung & Trả về data thuần
const setupResponseInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      console.error('API Error:', error.response?.data || error.message);
    if(error.response?.status === 403) {
      // code rieng
    }
      // Xử lý hết hạn token
      if (error.response?.status === 401 ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Không redirect tự động để tránh loop, để Component xử lý hoặc dùng event
      }
      
      return Promise.reject(error.response?.data || error);
    }
  );
};

setupResponseInterceptor(userAxios);
setupResponseInterceptor(adminAxios);