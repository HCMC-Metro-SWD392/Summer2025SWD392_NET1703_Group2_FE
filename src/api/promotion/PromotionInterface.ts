export enum PromotionType {
    Percentage = 'Percentage',
    FixedAmount = 'FixedAmount'
}

export interface CreatePromotionDTO {
    code: string; 
    percentage?: number | null; 
    fixedAmount?: number | null;
    promotionType: PromotionType | number;
    description?: string | null;
    startDate: Date; 
    endDate: Date;
}

export interface GetPromotionDTO {
    id: string;
    code: string; // Required, non-nullable
    percentage?: number | null; // Optional, but must be between 0-100 if provided
    fixedAmount?: number | null; // Optional, but must be positive integer if provided
    promotionType: PromotionType | number;
    description?: string | null;
    startDate: Date; // Required, non-nullable
    endDate: Date; // Required, non-nullable
}

export interface UpdatePromotionDTO {
    id: string;
    code: string; // Required, non-nullable
    percentage?: number | string | null; // Optional, but must be between 0-100 if provided
    fixedAmount?: number | string | null; // Optional, but must be positive integer if provided
    promotionType: PromotionType | number;
    description?: string | null;
    startDate: Date; // Required, non-nullable
    endDate: Date; // Required, non-nullable
}
