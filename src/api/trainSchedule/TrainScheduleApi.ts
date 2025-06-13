import type { AxiosResponse } from 'axios';
import type { CreateTrainScheduleDTO, GetTrainScheduleDTO, UpdateTrainScheduleDTO } from './TrainScheduleInterface';
import axiosInstance from '../../settings/axiosInstance';

// API Endpoints
const TRAIN_SCHEDULE_ENDPOINTS = {
    CREATE: '/api/TrainSchedule/create-train-schedule',
    GET_ALL: '/api/TrainSchedule/get-all-metro-schedule',
    UPDATE: '/api/TrainSchedule/update-train-schedule',
    GET_BY_ID: '/api/TrainSchedule/get-train-schedules',
    CANCEL: '/api/TrainSchedule/cancel-train-schedule'
} as const;

export interface ResponseDTO<T = any> {
    statusCode: number;
    isSuccess: boolean;
    message: string;
    result?: T;
    total?: number; // Total count for pagination
}

export interface PaginationParams {
    filterOn?: string;
    filterQuery?: string;
    sortBy?: string;
    isAscending?: boolean;
    pageNumber?: number;
    pageSize?: number;
}

export const TrainScheduleApi = {
    createTrainSchedule: async (metroLineId: string): Promise<ResponseDTO> => {
        try {
            const response: AxiosResponse<ResponseDTO> = await axiosInstance.post(
                TRAIN_SCHEDULE_ENDPOINTS.CREATE,
                metroLineId
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                return error.response.data;
            }
            throw error;
        }
    },

    updateTrainSchedule: async (data: UpdateTrainScheduleDTO): Promise<ResponseDTO> => {
        try {
            const response: AxiosResponse<ResponseDTO> = await axiosInstance.put(
                TRAIN_SCHEDULE_ENDPOINTS.UPDATE,
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

    getAllTrainSchedules: async (params: PaginationParams): Promise<ResponseDTO<GetTrainScheduleDTO[]>> => {
        try {
            const response: AxiosResponse<ResponseDTO<GetTrainScheduleDTO[]>> = await axiosInstance.get(
                TRAIN_SCHEDULE_ENDPOINTS.GET_ALL,
                {
                    params: {
                        filterOn: params.filterOn,
                        filterQuery: params.filterQuery,
                        sortBy: params.sortBy,
                        isAscending: params.isAscending,
                        pageNumber: params.pageNumber || 1,
                        pageSize: params.pageSize || 10
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

    getTrainScheduleById: async (trainScheduleId: string): Promise<ResponseDTO<GetTrainScheduleDTO>> => {
        try {
            const response: AxiosResponse<ResponseDTO<GetTrainScheduleDTO>> = await axiosInstance.get(
                `${TRAIN_SCHEDULE_ENDPOINTS.GET_BY_ID}/${trainScheduleId}`
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                return error.response.data;
            }
            throw error;
        }
    },

    cancelTrainSchedule: async (trainScheduleId: string): Promise<ResponseDTO> => {
        try {
            const response: AxiosResponse<ResponseDTO> = await axiosInstance.put(
                `${TRAIN_SCHEDULE_ENDPOINTS.CANCEL}/${trainScheduleId}`
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
