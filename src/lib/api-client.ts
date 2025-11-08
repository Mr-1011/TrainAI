import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
}

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshRequest: Promise<RefreshResponse> | null = null;

const persistAuthData = (data: RefreshResponse) => {
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  localStorage.setItem(
    'user',
    JSON.stringify({
      user_id: data.user_id,
      email: data.email,
    }),
  );
};

const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

const requestTokenRefresh = (refreshToken: string): Promise<RefreshResponse> => {
  if (!refreshRequest) {
    refreshRequest = axios
      .post<RefreshResponse>(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      })
      .then((response) => {
        persistAuthData(response.data);
        return response.data;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
};

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes('/auth/signin') &&
      !originalRequest.url.includes('/auth/signup') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { access_token } = await requestTokenRefresh(refreshToken);

        originalRequest._retry = true;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
