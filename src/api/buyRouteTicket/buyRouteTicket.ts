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

export const createPaymentLink = async ({
  ticketRouteId,
  codePromotion,
}: {
  ticketRouteId: string;
  codePromotion?: string;
}) => {
  const response = await axiosInstance.post(
    endpoints.createPaymentLink,
    {
      ticketRouteId,
      codePromotion: codePromotion || null,
    }
  );
  return response.data;
};

export const fetchTimetable = async (stationId: string) => {
  const response = await axiosInstance.get(endpoints.getMetroSchedule, {
    params: {
      filterOn: "stationId",
      filterQuery: stationId,
      sortBy: "startTime",
      isAcsending: true,
    },
  });
  return response.data;

};
