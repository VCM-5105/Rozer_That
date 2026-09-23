import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Send cookies for refresh-token support across Vercel & Render
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Access Token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('rozer_access_token') || localStorage.getItem('rozer_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle Token Expiration & Refresh Token Rotation
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const storedRefreshToken = localStorage.getItem('rozer_refresh_token');
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );

        const newAccessToken = res.data.data.accessToken;
        const newRefreshToken = res.data.data.refreshToken;

        if (newAccessToken) {
          localStorage.setItem('rozer_access_token', newAccessToken);
          localStorage.setItem('rozer_token', newAccessToken);
        }
        if (newRefreshToken) {
          localStorage.setItem('rozer_refresh_token', newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('rozer_access_token');
        localStorage.removeItem('rozer_token');
        localStorage.removeItem('rozer_refresh_token');
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
