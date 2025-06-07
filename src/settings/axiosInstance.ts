// src/api/axiosInstance.ts
import axios from "axios";
import endpoints from "../api/endpoints";
import { removeTokens, getAccessToken, getRefreshToken, setTokens } from "../api/auth/tokenUtils";

export const BASE_URL = import.meta.env.VITE_BASE_URL;
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Add Access Token
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh Token on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        const res = await axios.post(BASE_URL + endpoints.refresh, { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = res.data;
        setTokens(accessToken, newRefreshToken);
        axiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        removeTokens();
        window.location.href = "/login"; // hoặc chuyển về trang đăng nhập
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
