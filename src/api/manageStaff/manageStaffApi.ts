import type { AxiosResponse } from 'axios';
import type { 
  ResponseDTO, 
  SetStaffRoleRequest, 
  StaffInfo,
  StaffListResponse, 
  StaffDetailResponse 
} from "./manageStaffInterface";
import axiosInstance from "../../settings/axiosInstance";

// API Endpoints
const MANAGE_STAFF_ENDPOINTS = {
  SET_STAFF_ROLE: (email: string) => `/api/Auth/set-staff-role/${email}`,
  GET_ALL_STAFF: "/api/Staff/GetAllStaff",
  GET_STAFF_BY_ID: (id: string) => `/api/Auth/get-staff/${id}`,
} as const;

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  filterOn?: string;
  filterQuery?: string;
  sortBy?: string;
  isAscending?: boolean;
}

// Staff Management API Service
export const ManageStaffApi = {
  setStaffRole: async (email: string): Promise<ResponseDTO> => {
    try {
      const response: AxiosResponse<ResponseDTO> = await axiosInstance.put(
        MANAGE_STAFF_ENDPOINTS.SET_STAFF_ROLE(email)
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  getAllStaff: async (): Promise<ResponseDTO> => {
    try {
      const response: AxiosResponse<ResponseDTO> = await axiosInstance.get(
        MANAGE_STAFF_ENDPOINTS.GET_ALL_STAFF,
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  getStaffById: async (id: string): Promise<StaffDetailResponse> => {
    try {
      const response: AxiosResponse<StaffDetailResponse> = await axiosInstance.get(
        MANAGE_STAFF_ENDPOINTS.GET_STAFF_BY_ID(id)
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

};
