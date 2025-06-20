import axios from "axios";

import type { LoginPayload, RegisterPayload } from "../../types/types";
import endpoints from "../endpoints";
import { removeTokens, setTokens, decodeToken } from "./tokenUtils";
import axiosInstance from "../../settings/axiosInstance";
import { BASE_URL } from "../../settings/signalrConnection";

export const register = async (data: RegisterPayload) => {
  const response = await axiosInstance.post(endpoints.register, data);
  return response.data;
};

export const login = async (data: LoginPayload) => {
  const res = await axios.post(endpoints.login, data, {
    baseURL: BASE_URL
  });
  const { accessToken, refreshToken } = res.data.result;
  setTokens(accessToken, refreshToken);
  
  // Decode token to get user role
  const decodedToken = decodeToken(accessToken);
  const userRole = decodedToken?.role?.toLowerCase();

  // Store user info in localStorage
  localStorage.setItem("userInfo", JSON.stringify(res.data.result?.user));

  // Return both the response data and the user role
  return {
    ...res.data,
    userRole
  };
};

export const logout = async () => {
  try {
    // await axiosInstance.post(endpoints.logout);
  } catch (error) {
    console.error("Logout API error", error);
  } finally {
    removeTokens();
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  }
};
