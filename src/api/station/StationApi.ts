import type { AxiosResponse } from 'axios';
import type { CreateStationDTO, UpdateStationDTO, Station, ResponseDTO } from './StationInterface';
import axiosInstance from '../../settings/axiosInstance';

// API Endpoints
const STATION_ENDPOINTS = {
    CREATE: 'api/Station/create-station',
    UPDATE: 'api/Station/update-station',
    GET_ALL: 'api/Station/get-all-stations',
    GET_BY_ID: 'api/Station/get-station-by-id'
};

// Station API Service
export const StationApi = {
    // Create a new station
    createStation: async (data: CreateStationDTO): Promise<ResponseDTO<Station>> => {
        try {
            const response: AxiosResponse<ResponseDTO<Station>> = await axiosInstance.post(
                STATION_ENDPOINTS.CREATE,
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

    // Update an existing station
    updateStation: async (stationId: string, data: UpdateStationDTO): Promise<ResponseDTO<Station>> => {
        try {
            const response: AxiosResponse<ResponseDTO<Station>> = await axiosInstance.put(
                `${STATION_ENDPOINTS.UPDATE}/${stationId}`,
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

    // Get all stations
    getAllStations: async (options?: {
        isActive?: boolean | null,
        isAscending?: boolean,
        pageNumber?: number,
        pageSize?: number
    }): Promise<ResponseDTO<Station[]>> => {
        try {
            const params: any = {};
            if (options) {
                if (options.isActive !== null && options.isActive !== undefined) params.isActive = options.isActive;
                if (options.isAscending !== undefined) params.isAscending = options.isAscending;
                if (options.pageNumber !== undefined) params.pageNumber = options.pageNumber;
                if (options.pageSize !== undefined) params.pageSize = options.pageSize;
            }
            const response: AxiosResponse<ResponseDTO<Station[]>> = await axiosInstance.get(
                STATION_ENDPOINTS.GET_ALL,
                { params }
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                return error.response.data;
            }
            throw error;
        }
    },

    // Get station by ID
    getStationById: async (stationId: string): Promise<ResponseDTO<Station>> => {
        try {
            const response: AxiosResponse<ResponseDTO<Station>> = await axiosInstance.get(
                `${STATION_ENDPOINTS.GET_BY_ID}/${stationId}`
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                return error.response.data;
            }
            throw error;
        }
    },

    // Set isActive status for a station
    setIsActive: async (stationId: string, isActive: boolean): Promise<ResponseDTO<Station>> => {
        try {
            const response: AxiosResponse<ResponseDTO<Station>> = await axiosInstance.patch(
                `/api/Station/set-isActive/${stationId}`,
                { isActive }
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
