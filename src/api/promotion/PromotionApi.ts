import type { AxiosResponse } from 'axios';
import type { CreatePromotionDTO, GetPromotionDTO, UpdatePromotionDTO } from './PromotionInterface';
import { PromotionType } from './PromotionInterface';
import axiosInstance from '../../settings/axiosInstance';
import { useNavigate } from 'react-router-dom';

// API Endpoints
const PROMOTION_ENDPOINTS = {
    CREATE: '/api/Promotion/create-promotion',
    GET_ALL: '/api/Promotion/get-all-promotions',
    UPDATE: '/api/Promotion/update-promotion',
    GET_BY_ID: '/api/Promotion/get-promotion',
    DELETE: '/api/Promotion/delete-promotion'
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

export const PromotionApi = {
    createPromotion: async (data: CreatePromotionDTO): Promise<ResponseDTO> => {
        try {
            const response: AxiosResponse<ResponseDTO> = await axiosInstance.post(
                PROMOTION_ENDPOINTS.CREATE,
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

    updatePromotion: async (data: UpdatePromotionDTO): Promise<ResponseDTO> => {
        try {
            const response: AxiosResponse<ResponseDTO> = await axiosInstance.patch(
                `/api/Promotion/update-promotion/${data.id}`,
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

    getAllPromotions: async (params: PaginationParams): Promise<ResponseDTO<GetPromotionDTO[]>> => {
        try {
            const response: AxiosResponse<ResponseDTO<GetPromotionDTO[]>> = await axiosInstance.get(
                PROMOTION_ENDPOINTS.GET_ALL,
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

    getPromotionById: async (promotionId: string): Promise<ResponseDTO<GetPromotionDTO>> => {
        try {
            const response: AxiosResponse<ResponseDTO<GetPromotionDTO>> = await axiosInstance.get(
                `${PROMOTION_ENDPOINTS.GET_BY_ID}/${promotionId}`
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                return error.response.data;
            }
            throw error;
        }
    },

    deletePromotion: async (promotionId: string): Promise<ResponseDTO> => {
        try {
            const response: AxiosResponse<ResponseDTO> = await axiosInstance.put(
                `${PROMOTION_ENDPOINTS.DELETE}/${promotionId}`
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
