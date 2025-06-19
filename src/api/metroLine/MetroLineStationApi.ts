import type { AxiosResponse } from 'axios';
import type { CreateMetroLineStationDTO, GetMetroLineStationDTO } from './MetroLineStationInterface';
import type { ResponseDTO } from '../station/StationInterface';
import axiosInstance from '../../settings/axiosInstance';

// API Endpoints
const METRO_LINE_STATION_ENDPOINTS = {
    CREATE: '/api/MetroLineStation/create-metro-line-station',
    GET_BY_METRO_LINE_ID: (metroLineId: string) => `/api/MetroLineStation/get-station-by-metro-line-id/${metroLineId}`
} as const;

// Metro Line Station API Service
export const MetroLineStationApi = {
    createMetroLineStation: async (data: CreateMetroLineStationDTO): Promise<ResponseDTO<GetMetroLineStationDTO>> => {
        try {
            const response: AxiosResponse<ResponseDTO<GetMetroLineStationDTO>> = await axiosInstance.post(
                METRO_LINE_STATION_ENDPOINTS.CREATE,
                data
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                // Return backend error response
                return error.response.data;
            }
            // Handle network errors or other unexpected errors
            throw new Error('Có lỗi xảy ra khi tạo trạm Metro');
        }
    },

    getStationByMetroLineId: async (metroLineId: string): Promise<ResponseDTO<GetMetroLineStationDTO[]>> => {
        try {
            const response: AxiosResponse<ResponseDTO<GetMetroLineStationDTO[]>> = await axiosInstance.get(
                METRO_LINE_STATION_ENDPOINTS.GET_BY_METRO_LINE_ID(metroLineId)
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                // Return backend error response
                return error.response.data;
            }
            // Handle network errors or other unexpected errors
            throw new Error('Có lỗi xảy ra khi lấy danh sách trạm Metro');
        }
    }
};
