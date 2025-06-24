import axios from "axios";

import type { LoginPayload, RegisterPayload } from "../../types/types";
import endpoints from "../endpoints";
import { removeTokens, setTokens, decodeToken, removeUserInfo } from "./tokenUtils";
import axiosInstance, { BASE_URL } from "../../settings/axiosInstance";
import { message } from "antd";
import { jwtDecode } from "jwt-decode";

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

export const checkUserRole = (allowedRoles: string | string[]): boolean => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    // message.error("Không tìm thấy token.");
    removeTokens();
    removeUserInfo();
    window.location.href = "/login";
    return false;
  }

  try {
    const decoded: any = jwtDecode(token);
    const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (!role) {
      // message.error("Không tìm thấy role trong token.");
      return false;
    }

    if (Array.isArray(allowedRoles)) {
      if (allowedRoles.includes(role)) return true;
    } else {
      if (role === allowedRoles) return true;
    }

    message.error("Bạn không có quyền truy cập trang này.");
    return false;

  } catch (error) {
    // console.error("Lỗi giải mã token:", error);
    // message.error("Token không hợp lệ.");
    return false;
  }
};
