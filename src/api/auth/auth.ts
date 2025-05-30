import axios from "axios";
import axiosInstance, { BASE_URL } from "../../settings/axiosInstance";
import type { LoginPayload, RegisterPayload } from "../../types/types";
import endpoints from "../endpoints";
import { clearTokens, setTokens } from "./tokenUtils";

export const register = async (data: RegisterPayload) => {
  const response = await axiosInstance.post(endpoints.register, data);
  return response.data;
};

export const login = async (data: LoginPayload) => {
  const res = await axios.post(endpoints.login,  data,  {
  baseURL: BASE_URL });
  const { accessToken, refreshToken } = res.data.result;
  setTokens(accessToken, refreshToken);
  return res.data;
};

export const logout = async () => {
  try {
    // await axiosInstance.post(endpoints.logout);
  } catch (error) {
    console.error("Logout API error", error);
  } finally {
    clearTokens();
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  }
};
