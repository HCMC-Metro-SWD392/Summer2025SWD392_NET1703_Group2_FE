import type { AxiosResponse } from 'axios';
import type { CreateMetroLineStationDTO, GetMetroLineStationDTO, UpdateMetroLineStationDTO } from './MetroLineStationInterface';
import type { ResponseDTO } from '../station/StationInterface';
import axiosInstance from '../../settings/axiosInstance';

// API Endpoints
const METRO_LINE_STATION_ENDPOINTS = {
    CREATE: '/api/MetroLineStation/create-metro-line-station',
    GET_BY_METRO_LINE_ID: (metroLineId: string) => `/api/MetroLineStation/get-station-by-metro-line-id/${metroLineId}`
} as const;

const METRO_LINE_STATION_UPDATE_ENDPOINT = '/api/MetroLineStation/update-metro-line-station';

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
    },

    updateMetroLineStation: async (data: UpdateMetroLineStationDTO): Promise<ResponseDTO<GetMetroLineStationDTO>> => {
        try {
            const { metroLineStationId, ...updateData } = data;
            const response: AxiosResponse<ResponseDTO<GetMetroLineStationDTO>> = await axiosInstance.put(
                `${METRO_LINE_STATION_UPDATE_ENDPOINT}/${metroLineStationId}`,
                updateData
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                return error.response.data;
            }
            throw new Error('Có lỗi xảy ra khi cập nhật trạm Metro');
        }
    }
};
