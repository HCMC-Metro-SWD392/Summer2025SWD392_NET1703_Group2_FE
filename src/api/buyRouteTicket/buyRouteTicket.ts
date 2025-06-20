import axiosInstance from "../../settings/axiosInstance";
import endpoints from "../endpoints";
import type { Station, Line } from "../../types/types";

// Lấy danh sách tuyến
export const getMetroLines = async () => {
  const response = await axiosInstance.get(endpoints.metroLines);
  return response.data;
};

// Lấy danh sách ga theo tuyến
export const getStationsByMetroLine = async (lineId: string) => {
  const response = await axiosInstance.get(endpoints.metroStations(lineId));
  return response.data;
};

export const getTicketRoute = async (startStationId: string, endStationId: string) => {
  const response = await axiosInstance.get(endpoints.getTicketRoute(startStationId, endStationId));
  return response.data;
};

export const getAllStations = async () => {
  const response = await axiosInstance.get(endpoints.getAllStations);
  return response.data;
};

export const getSpecialTicket = async (startStationId: string, endStationId: string, ticketTypeId: string) => {
  const response = await axiosInstance.get(endpoints.getSpecialTicket(startStationId, endStationId, ticketTypeId));
  return response.data;
};

export const createTicketRoute = async (startStationId: string, endStationId: string) => {
  const response = await axiosInstance.post(
    endpoints.createTicketRoute,
    {
      startStationId,
      endStationId,
    }
  );
  return response.data;
};

export const createTicketSubcription = async (ticketTypeId: string, startStationId: string, endStationId: string) => {
  const response = await axiosInstance.post(
    endpoints.createTicketSubscription,
    {
      ticketTypeId,
      startStationId,
      endStationId,
    }
  );
  return response.data;
};

export const createPaymentLink = async ({
  ticketRouteId,
  subscriptionTicketId,
  codePromotion,
}: {
  ticketRouteId?: string;
  subscriptionTicketId?: string,
  codePromotion?: string;
}) => {
  const response = await axiosInstance.post(
    endpoints.createPaymentLink,
    {
      ticketRouteId: ticketRouteId || null,
      subscriptionTicketId: subscriptionTicketId || null,
      codePromotion: codePromotion || null,
    }
  );
  return response.data;
};

export const fetchTimetable = async (stationId: string) => {
  const response = await axiosInstance.get(endpoints.getMetroScheduleByStation(stationId));
  return response.data;

};

export const getAvailableTicketTypes = async () => {
  const res = await axiosInstance.get(endpoints.getTicketType);
  return res.data;
};

export const getQRCodeFromSubscription = async (ticketId: string) => {
  const res = await axiosInstance.get(endpoints.getQRCodeFromSubscription(ticketId));
  return res.data;
};
