import type { AxiosResponse } from 'axios';
import type { 
    CreateSubscriptionDTO, 
    GetSubscriptionTicketDTO, 
    ResponseDTO,
    UpdateSubscriptionDTO
} from './TicketInterface';
import { SubscriptionTicketType } from './TicketInterface';
import axiosInstance from '../../settings/axiosInstance';

// Convert enum to numeric value
const getTicketTypeNumericValue = (type: SubscriptionTicketType): number => {
    switch (type) {
        case SubscriptionTicketType.DAILY:
            return 1;
        case SubscriptionTicketType.WEEKLY:
            return 2;
        case SubscriptionTicketType.MONTHLY:
            return 3;
        case SubscriptionTicketType.YEARLY:
            return 4;
        default:
            throw new Error('Invalid ticket type');
    }
};

// API Endpoints
const SUBSCRIPTION_TICKET_ENDPOINTS = {
    CREATE: '/api/SubscriptionTicket',
    GET_ALL: '/api/SubscriptionTicket/all',
    GET_BY_ID: '/api/SubscriptionTicket/',
    UPDATE: '/api/SubscriptionTicket/update/'
} as const;

// Subscription Ticket API Service
export const TicketApi = {
    getAllSubscriptions: async (): Promise<ResponseDTO<GetSubscriptionTicketDTO[]>> => {
        try {
            const response: AxiosResponse<ResponseDTO<GetSubscriptionTicketDTO[]>> = await axiosInstance.get(
                SUBSCRIPTION_TICKET_ENDPOINTS.GET_ALL
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                return error.response.data;
            }
            throw new Error('Có lỗi xảy ra khi lấy danh sách vé đăng ký');
        }
    },

    getSubscriptionById: async (id: string): Promise<ResponseDTO<GetSubscriptionTicketDTO>> => {
        try {
            const response: AxiosResponse<ResponseDTO<GetSubscriptionTicketDTO>> = await axiosInstance.get(
                `${SUBSCRIPTION_TICKET_ENDPOINTS.GET_BY_ID}${id}`
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                return error.response.data;
            }
            throw new Error('Có lỗi xảy ra khi lấy thông tin vé đăng ký');
        }
    },

    createSubscription: async (data: CreateSubscriptionDTO): Promise<ResponseDTO<GetSubscriptionTicketDTO>> => {
        try {
            const response: AxiosResponse<ResponseDTO<GetSubscriptionTicketDTO>> = await axiosInstance.post(
                SUBSCRIPTION_TICKET_ENDPOINTS.CREATE,
                {
                    TicketName: data.ticketName,
                    ticketType: getTicketTypeNumericValue(data.ticketType),
                    price: data.price
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                // Return backend error response
                return error.response.data;
            }
            // Handle network errors or other unexpected errors
            throw new Error('Có lỗi xảy ra khi tạo vé đăng ký');
        }
    },

    updateSubscription: async (id: string, data: UpdateSubscriptionDTO): Promise<ResponseDTO<GetSubscriptionTicketDTO>> => {
        try {
            const response: AxiosResponse<ResponseDTO<GetSubscriptionTicketDTO>> = await axiosInstance.put(
                `${SUBSCRIPTION_TICKET_ENDPOINTS.UPDATE}${id}`,
                {
                    TicketName: data.ticketName,
                    ticketType: data.ticketType ? getTicketTypeNumericValue(data.ticketType) : undefined,
                    price: data.price
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                return error.response.data;
            }
            throw new Error('Có lỗi xảy ra khi cập nhật vé đăng ký');
        }
    }
};
