import type { AxiosResponse } from 'axios';
import type { CreateFareRuleDTO, UpdateFareRuleDTO, FareRule, ResponseDTO } from './FareInterface';
import axiosInstance from '../../settings/axiosInstance';

// API Endpoints
const FARE_RULE_ENDPOINTS = {
    CREATE: '/api/FareRule/create-fare-rule',
    GET_ALL: '/api/FareRule/fare-rules/all',
    UPDATE: '/api/FareRule/update-fare-rule'
} as const;

export interface PaginationParams {
    filterOn?: string;
    filterQuery?: string;
    sortBy?: string;
    isAscending?: boolean;
    pageNumber?: number;
    pageSize?: number;
}

// Fare Rule API Service
export const FareApi = {
    createFareRule: async (data: CreateFareRuleDTO): Promise<ResponseDTO<FareRule>> => {
        try {
            const response: AxiosResponse<ResponseDTO<FareRule>> = await axiosInstance.post(
                FARE_RULE_ENDPOINTS.CREATE,
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

    getAllFareRules: async (params: PaginationParams): Promise<ResponseDTO<FareRule[]>> => {
        try {
            const response: AxiosResponse<ResponseDTO<FareRule[]>> = await axiosInstance.get(
                FARE_RULE_ENDPOINTS.GET_ALL,
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

    updateFareRule: async (data: UpdateFareRuleDTO): Promise<ResponseDTO<FareRule>> => {
        try {
            const response: AxiosResponse<ResponseDTO<FareRule>> = await axiosInstance.put(
                FARE_RULE_ENDPOINTS.UPDATE,
                data
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
