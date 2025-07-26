import type { AxiosResponse } from 'axios';
import axiosInstance from '../../../settings/axiosInstance';
import type { CreateStaffScheduleDTO, GetScheduleDTO } from './StaffScheduleInterface';
import type { ResponseDTO } from './StaffScheduleInterface';
import type { UpdateShiftDTO } from './StaffScheduleInterface';

const STAFF_SCHEDULE_ENDPOINTS = {
  GET_ALL: '/api/StaffSchedule/schedules',
  CREATE: '/api/StaffSchedule/create',
  GET_BY_STATION_AND_DATE: '/api/StaffSchedule/schedules-by-station',
  GET_ALL_STAFF_UNSCHEDULED: '/api/StaffSchedule/get-unscheduled-staff',
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

  getUnscheduledStaff: async (workingDate: string, shiftId: string): Promise<ResponseDTO> => {
    try {
      const response: AxiosResponse<ResponseDTO> = await axiosInstance.get(
        STAFF_SCHEDULE_ENDPOINTS.GET_ALL_STAFF_UNSCHEDULED,
        { params: { workingDate, shiftId } }
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

  updateStaffShift: async (shiftId: string, data: UpdateShiftDTO): Promise<ResponseDTO> => {
    try {
      const response: AxiosResponse<ResponseDTO> = await axiosInstance.put(
        `/api/StaffShift/update/${shiftId}`,
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

  assignStaff: async (staffId: string, shiftId: string, scheduleId: string, workingStationId: string): Promise<ResponseDTO> => {
    try {
      const response: AxiosResponse<ResponseDTO> = await axiosInstance.put(
        `/api/StaffSchedule/assign-staff`,
        undefined,
        { params: { staffId, shiftId, scheduleId, workingStationId } }
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
