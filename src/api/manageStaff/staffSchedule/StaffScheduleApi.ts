import type { AxiosResponse } from 'axios';
import axiosInstance from '../../../settings/axiosInstance';
import type { CreateStaffScheduleDTO, GetScheduleDTO } from './StaffScheduleInterface';
import type { ResponseDTO } from './StaffScheduleInterface';

const STAFF_SCHEDULE_ENDPOINTS = {
  GET_ALL: '/api/StaffSchedule/schedules',
  CREATE: '/api/StaffSchedule/create',
  GET_BY_STATION_AND_DATE: '/api/StaffSchedule/schedules-by-station',
} as const;

export const StaffScheduleApi = {
  getAllSchedules: async (startDate: string, endDate: string): Promise<ResponseDTO<GetScheduleDTO[]>> => {
    try {
      const response: AxiosResponse<ResponseDTO<GetScheduleDTO[]>> = await axiosInstance.get(
        STAFF_SCHEDULE_ENDPOINTS.GET_ALL,
        {
          params: { startDate, endDate }
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

  createStaffSchedule: async (data: CreateStaffScheduleDTO): Promise<ResponseDTO<GetScheduleDTO>> => {
    try {
      const response: AxiosResponse<ResponseDTO<GetScheduleDTO>> = await axiosInstance.post(
        STAFF_SCHEDULE_ENDPOINTS.CREATE,
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

  getSchedulesByStationIdAndDate: async (stationId: string, workingDate: string): Promise<ResponseDTO<GetScheduleDTO[]>> => {
    try {
      const response: AxiosResponse<ResponseDTO<GetScheduleDTO[]>> = await axiosInstance.get(
        STAFF_SCHEDULE_ENDPOINTS.GET_BY_STATION_AND_DATE,
        {
          params: { stationId, workingDate }
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
};
