export enum SubscriptionTicketType {
    DAILY = 'DAILY',           
    WEEKLY = 'WEEKLY',         
    MONTHLY = 'MONTHLY',      
    YEARLY = 'YEARLY'         
}

export interface CreateSubscriptionDTO {
    ticketName: string;      
    ticketType: SubscriptionTicketType; 
    price: number;            
}

export interface GetSubscriptionTicketDTO {
    id: string;                
    ticketName: string;    
    ticketType: SubscriptionTicketType;  
    price: number;            
    startDate: string;        
    endDate: string;         
}

export interface ResponseDTO<T = any> {
    isSuccess: boolean;
    statusCode: number;
    message: string;
    result?: T;
}

export type SubscriptionTicketStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface SubscriptionTicket extends GetSubscriptionTicketDTO {
    status: SubscriptionTicketStatus;
    createdAt: string;         
    updatedAt: string;         
}

export interface TicketTypeConfig {
    label: string;             
    description: string;       
    durationInDays: number;    
}

export const TICKET_TYPE_CONFIG: Record<SubscriptionTicketType, TicketTypeConfig> = {
    [SubscriptionTicketType.DAILY]: {
        label: 'Vé Ngày',
        description: 'Vé sử dụng trong 24 giờ',
        durationInDays: 1
    },
    [SubscriptionTicketType.WEEKLY]: {
        label: 'Vé Tuần',
        description: 'Vé sử dụng trong 7 ngày',
        durationInDays: 7
    },
    [SubscriptionTicketType.MONTHLY]: {
        label: 'Vé Tháng',
        description: 'Vé sử dụng trong 30 ngày',
        durationInDays: 30
    },
    [SubscriptionTicketType.YEARLY]: {
        label: 'Vé Năm',
        description: 'Vé sử dụng trong 365 ngày',
        durationInDays: 365
    }
};
