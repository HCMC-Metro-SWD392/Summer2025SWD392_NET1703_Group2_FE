import type { AxiosResponse } from 'axios';
import type { 
    CreateMetroLineDTO, 
    GetMetroLineDTO, 
    ResponseDTO, 
    UpdateMetroLineStationDTO
} from './MetroLineInterface';
import { MetroLineStatus } from './MetroLineInterface';
import axiosInstance from '../../settings/axiosInstance';

// API Endpoints
const METRO_LINE_ENDPOINTS = {
    CREATE: '/api/MetroLine/create-metro-line',
    GET_ALL: '/api/MetroLine/metro-lines/all',
    GET_BY_ID: (id: string) => `/api/MetroLine/metro-line/${id}`,
    UPDATE_METRO_LINE_STATION: (metroLineStationId: string) => `/api/MetroLineStation/update-metroline-station/${metroLineStationId}`,
    REMOVE_METRO_LINE_STATION: (metroLineStationId: string) => `/api/MetroLineStation/remove-metroline-station/${metroLineStationId}`,
    CHANGE_STATUS: (metroLineId: string) => `/api/MetroLine/change-status/${metroLineId}`
} as const;

// Metro Line API Service
export const MetroLineApi = {
    createMetroLine: async (data: CreateMetroLineDTO): Promise<ResponseDTO<GetMetroLineDTO>> => {
        try {
            const response: AxiosResponse<ResponseDTO<GetMetroLineDTO>> = await axiosInstance.post(
                METRO_LINE_ENDPOINTS.CREATE,
                data
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                // Return backend error response
                return error.response.data;
            }
            // Handle network errors or other unexpected errors
            throw new Error('Có lỗi xảy ra khi tạo tuyến Metro');
        }
    },

    getAllMetroLines: async (isActive?: boolean | null): Promise<ResponseDTO<GetMetroLineDTO[]>> => {
        try {
            const params: any = {};
            if (isActive !== null && isActive !== undefined) {
                params.isActive = isActive;
            }
            
            const response: AxiosResponse<ResponseDTO<GetMetroLineDTO[]>> = await axiosInstance.get(
                METRO_LINE_ENDPOINTS.GET_ALL,
                { params }
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                // Return backend error response
                return error.response.data;
            }
            // Handle network errors or other unexpected errors
            throw new Error('Có lỗi xảy ra khi lấy danh sách tuyến Metro');
        }
    },

    getMetroLineById: async (id: string): Promise<ResponseDTO<GetMetroLineDTO>> => {
        try {
            const response: AxiosResponse<ResponseDTO<GetMetroLineDTO>> = await axiosInstance.get(
                METRO_LINE_ENDPOINTS.GET_BY_ID(id)
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                // Return backend error response
                return error.response.data;
            }
            // Handle network errors or other unexpected errors
            throw new Error('Có lỗi xảy ra khi lấy thông tin tuyến Metro');
        }
    },

    updateMetroLineStation: async (
        metroLineStationId: string,
        data: UpdateMetroLineStationDTO
    ): Promise<ResponseDTO<any>> => {
        try {
            const response: AxiosResponse<ResponseDTO<any>> = await axiosInstance.put(
                METRO_LINE_ENDPOINTS.UPDATE_METRO_LINE_STATION(metroLineStationId),
                data
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                return error.response.data;
            }
            throw new Error('Có lỗi xảy ra khi cập nhật trạm tuyến Metro');
        }
    },

    removeMetroLineStation: async (
        metroLineStationId: string
    ): Promise<ResponseDTO<any>> => {
        try {
            const response: AxiosResponse<ResponseDTO<any>> = await axiosInstance.patch(
                METRO_LINE_ENDPOINTS.REMOVE_METRO_LINE_STATION(metroLineStationId)
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                return error.response.data;
            }
            throw new Error('Có lỗi xảy ra khi xóa trạm tuyến Metro');
        }
    },

    changeMetroLineStatus: async (
        metroLineId: string,
        metroLineStatus: MetroLineStatus
    ): Promise<ResponseDTO<any>> => {
        try {
            console.log('Changing metro line status:', { metroLineId, metroLineStatus });
            
            const response: AxiosResponse<ResponseDTO<any>> = await axiosInstance.put(
                METRO_LINE_ENDPOINTS.CHANGE_STATUS(metroLineId),
                null,
                {
                    params: {
                        metroLineStatus: metroLineStatus
                    }
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('Error in changeMetroLineStatus:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                return error.response.data;
            }
            throw new Error('Có lỗi xảy ra khi thay đổi trạng thái tuyến Metro');
        }
    }
};
