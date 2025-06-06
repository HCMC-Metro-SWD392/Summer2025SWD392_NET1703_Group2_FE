export interface CreateFareRuleDTO {
    minDistance: number;  // Maps to double in C#
    maxDistance: number;  // Maps to double in C#
    fare: number;        // Maps to int in C#
}

export interface UpdateFareRuleDTO {
    id: string;          // Maps to Guid in C#
    minDistance?: number; // Maps to double? (nullable double) in C#
    maxDistance?: number; // Maps to double? (nullable double) in C#
    fare?: number;       // Maps to int? (nullable int) in C#
}

export interface FareRule {
    id: string;          // Maps to Guid in C#
    minDistance: number; // Maps to double in C#
    maxDistance: number; // Maps to double in C#
    fare: number;        // Maps to int in C#
}

export interface ResponseDTO<T = any> {
    isSuccess: boolean;
    statusCode: number;
    message: string;
    result?: T;
}