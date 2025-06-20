// src/api/axiosInstance.ts
import axios from "axios";
import { getAccessToken } from "../api/auth/tokenUtils";

const axiosInstance = axios.create({
  baseURL: 'http://54.251.226.229:5000',
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
