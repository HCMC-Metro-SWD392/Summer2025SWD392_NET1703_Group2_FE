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
  GET_ALL_STAFF: "/api/Auth/get-all-staff",
  GET_STAFF_BY_ID: (id: string) => `/api/Auth/get-staff/${id}`,
  UPDATE_STAFF: (id: string) => `/api/Auth/update-staff/${id}`,
  DELETE_STAFF: (id: string) => `/api/Auth/delete-staff/${id}`,
  ACTIVATE_STAFF: (id: string) => `/api/Auth/activate-staff/${id}`,
  DEACTIVATE_STAFF: (id: string) => `/api/Auth/deactivate-staff/${id}`,
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

  getAllStaff: async (params: PaginationParams): Promise<StaffListResponse> => {
    try {
      const response: AxiosResponse<StaffListResponse> = await axiosInstance.get(
        MANAGE_STAFF_ENDPOINTS.GET_ALL_STAFF,
        {
          params: {
            pageNumber: params.pageNumber || 1,
            pageSize: params.pageSize || 10,
            filterOn: params.filterOn,
            filterQuery: params.filterQuery,
            sortBy: params.sortBy,
            isAscending: params.isAscending
          }
        }
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

  updateStaff: async (id: string, data: Partial<StaffInfo>): Promise<ResponseDTO> => {
    try {
      const response: AxiosResponse<ResponseDTO> = await axiosInstance.put(
        MANAGE_STAFF_ENDPOINTS.UPDATE_STAFF(id),
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

  deleteStaff: async (id: string): Promise<ResponseDTO> => {
    try {
      const response: AxiosResponse<ResponseDTO> = await axiosInstance.delete(
        MANAGE_STAFF_ENDPOINTS.DELETE_STAFF(id)
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  activateStaff: async (id: string): Promise<ResponseDTO> => {
    try {
      const response: AxiosResponse<ResponseDTO> = await axiosInstance.put(
        MANAGE_STAFF_ENDPOINTS.ACTIVATE_STAFF(id)
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  deactivateStaff: async (id: string): Promise<ResponseDTO> => {
    try {
      const response: AxiosResponse<ResponseDTO> = await axiosInstance.put(
        MANAGE_STAFF_ENDPOINTS.DEACTIVATE_STAFF(id)
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
