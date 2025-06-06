import type { AxiosResponse } from 'axios';
import type { 
    CreateSubscriptionDTO, 
    GetSubscriptionTicketDTO, 
    ResponseDTO 
} from './TicketInterface';
import axiosInstance from '../../settings/axiosInstance';

// API Endpoints
const SUBSCRIPTION_TICKET_ENDPOINTS = {
    CREATE: '/api/SubcriptionTicket'
} as const;

// Subscription Ticket API Service
export const TicketApi = {
    createSubscription: async (data: CreateSubscriptionDTO): Promise<ResponseDTO<GetSubscriptionTicketDTO>> => {
        try {
            const response: AxiosResponse<ResponseDTO<GetSubscriptionTicketDTO>> = await axiosInstance.post(
                SUBSCRIPTION_TICKET_ENDPOINTS.CREATE,
                {
                    dto: {
                        TicketName: data.ticketName,
                        ticketType: data.ticketType,
                        price: data.price
                    }
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
    }
};
