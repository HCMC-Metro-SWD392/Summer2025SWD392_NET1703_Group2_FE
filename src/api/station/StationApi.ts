import type { AxiosResponse } from 'axios';
import type { CreateStationDTO, UpdateStationDTO, Station, ResponseDTO } from './StationInterface';
import axiosInstance from '../../settings/axiosInstance';

// API Endpoints
const STATION_ENDPOINTS = {
    CREATE: '/station/create-station',
    UPDATE: '/station/update-station',
    GET_ALL: '/station/get-all-stations',
    GET_BY_ID: '/station/get-station-by-id'
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
    getAllStations: async (): Promise<ResponseDTO<Station[]>> => {
        try {
            const response: AxiosResponse<ResponseDTO<Station[]>> = await axiosInstance.get(
                STATION_ENDPOINTS.GET_ALL
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
    }
};
