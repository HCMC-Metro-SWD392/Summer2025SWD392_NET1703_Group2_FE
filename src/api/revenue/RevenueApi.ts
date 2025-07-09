import type { AxiosResponse } from 'axios';
import axiosInstance from '../../settings/axiosInstance';
import type {
  RevenueMonthDTO,
  RevenueYearDTO,
  RevenueOverTimeDTO,
  ResponseDTO
} from './RevenueInterface';

export const RevenueApi = {
  viewRevenueMonth: async (month: number): Promise<ResponseDTO<number>> => {
    const response: AxiosResponse<ResponseDTO<number>> = await axiosInstance.get(
      '/api/DashBoard/revenue-month',
      { params: { month } }
    );
    return response.data;
  },

  viewRevenueYear: async (year: number): Promise<ResponseDTO<number>> => {
    const response: AxiosResponse<ResponseDTO<number>> = await axiosInstance.get(
      '/api/DashBoard/revenue-year',
      { params: { year } }
    );
    return response.data;
  },

  viewRevenueOverTime: async (dateFrom: string, dateTo: string): Promise<ResponseDTO<number>> => {
    const response: AxiosResponse<ResponseDTO<number>> = await axiosInstance.get(
      '/api/DashBoard/revenue/overtime',
      { params: { dateFrom, dateTo } }
    );
    return response.data;
  }
};