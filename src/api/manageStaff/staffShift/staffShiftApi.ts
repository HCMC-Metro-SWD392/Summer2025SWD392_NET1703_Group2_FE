import type { AxiosResponse } from 'axios';
import axiosInstance from '../../../settings/axiosInstance';
import type { CreateShiftDTO, StaffShift } from './staffShiftInterface';

// API Endpoints
const STAFF_SHIFT_ENDPOINTS = {
    GET_ALL: '/api/StaffShift/get-all',
    CREATE: '/api/StaffShift/create',
} as const;

export const StaffShiftApi = {
    getAllStaffShifts: async (): Promise<StaffShift[]> => {
        try {
            const response: AxiosResponse<any> = await axiosInstance.get(
                STAFF_SHIFT_ENDPOINTS.GET_ALL
            );
            // The backend returns { isSuccess, result: StaffShift[] }
            return response.data?.result || [];
        } catch (error: any) {
            return [];
        }
    },

    createStaffShift: async (data: CreateShiftDTO): Promise<StaffShift> => {
        try {
            const response: AxiosResponse<any> = await axiosInstance.post(
                STAFF_SHIFT_ENDPOINTS.CREATE,
                data
            );
            return response.data?.result;
        } catch (error: any) {
            throw error;
        }
    },
};
