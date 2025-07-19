import axiosInstance from "../../settings/axiosInstance";
import type { AxiosResponse } from "axios";

// Role API Endpoints
const ROLE_ENDPOINTS = {
  SET_MANAGER: "/api/Auth/set-manager-role/",
  SET_ADMIN: "/api/Auth/set-admin-role/"
} as const;

export const RoleApi = {
  setManagerRole: async (email: string): Promise<any> => {
    try {
      const response: AxiosResponse<any> = await axiosInstance.put(
        `${ROLE_ENDPOINTS.SET_MANAGER}${email}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  setAdminRole: async (email: string): Promise<any> => {
    try {
      const response: AxiosResponse<any> = await axiosInstance.put(
        `${ROLE_ENDPOINTS.SET_ADMIN}${email}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  createManager: async (data: {
    phoneNumber: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
  }): Promise<any> => {
    try {
      const response: AxiosResponse<any> = await axiosInstance.post(
        "/api/Auth/create-manager",
        data
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  createAdmin: async (data: {
    phoneNumber: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
  }): Promise<any> => {
    try {
      const response: AxiosResponse<any> = await axiosInstance.post(
        "/api/Auth/create-admin",
        data
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  demoteRoleToUser: async (email: string): Promise<any> => {
    try {
      const response: AxiosResponse<any> = await axiosInstance.put(
        `/api/Auth/demote-role-to-user-for-admin/${email}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  demoteStaffToUser: async (email: string): Promise<any> => {
    try {
      const response: AxiosResponse<any> = await axiosInstance.put(
        `/api/Auth/demote-staff?email=${encodeURIComponent(email)}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  }
};
