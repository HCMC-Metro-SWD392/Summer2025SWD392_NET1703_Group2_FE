export interface CreateShiftDTO {
    shiftName: string;
    startTime: string;
    endTime: string;
}

export interface StaffShift {
    id: string;
    shiftName: string;
    startTime: string;
    endTime: string;
}

export interface ResponseDTO<T = any> {
    isSuccess: boolean;
    statusCode: number;
    message: string;
    result?: T;
    total?: number;  // Add total count for pagination
}