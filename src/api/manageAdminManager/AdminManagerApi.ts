import type { AxiosResponse } from 'axios';
import axiosInstance from '../../settings/axiosInstance';
import type { GetAdminManagerDTO } from './AdminManagerInterface';

// API Endpoints
const ADMIN_MANAGER_ENDPOINTS = {
  GET_ALL_MANAGERS: '/api/Auth/get-all-manager',
  GET_ALL_ADMINS: '/api/Auth/get-all-admin',
} as const;

export interface PaginationParams {
  filterOn?: string;
  filterQuery?: string;
  sortBy?: string;
  isAcensding?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface ResponseDTO<T = any> {
  statusCode: number;
  data: T;
  // Add other fields if needed
}

export const AdminManagerApi = {
  getAllManagers: async (
    params: PaginationParams
  ): Promise<ResponseDTO<GetAdminManagerDTO[]>> => {
    try {
      const response: AxiosResponse<any> =
        await axiosInstance.get(ADMIN_MANAGER_ENDPOINTS.GET_ALL_MANAGERS, { params });
      // Map backend response to expected frontend format
      return {
        statusCode: 200,
        data: response.data.result,
      };
    } catch (error: any) {
      if (error.response) {
        return {
          statusCode: error.response.status,
          data: [],
        };
      }
      throw error;
    }
  },

  getAllAdmins: async (
    params: PaginationParams
  ): Promise<ResponseDTO<GetAdminManagerDTO[]>> => {
    try {
      const response: AxiosResponse<any> =
        await axiosInstance.get(ADMIN_MANAGER_ENDPOINTS.GET_ALL_ADMINS, { params });
      return {
        statusCode: 200,
        data: response.data.result,
      };
    } catch (error: any) {
      if (error.response) {
        return {
          statusCode: error.response.status,
          data: [],
        };
      }
      throw error;
    }
  },
};
