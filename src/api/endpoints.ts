const endpoints = {
  login: "/api/Auth/sign-in",
  register: "/api/Auth/customer/register",
  refresh: "/auth/refresh-token",
  getUser: "/users/me",
  logout: "/auth/logout",
  weather: "https://api.openweathermap.org/data/2.5/weather",
  verifyEmail: "/api/auth/verify-email",
  metroLines: "/api/MetroLine/metro-lines/all",
  metroStations: (lineId: string) => `/api/MetroLineStation/get-station-by-metro-line-id/${lineId}`,
  getTicketRoute: (startStationId: string, endStationId: string) => `/api/TicketRoute/get-ticket-route-by-from-to/${startStationId}/${endStationId}`,
  createTicketRoute: "/api/TicketRoute/create-ticket-route",
  createPaymentLink: "/api/Payment/create-link-payment-ticket-route",
  createTicket: (orderCode: string) => `/api/Payment/payment-transactions/update-status/${orderCode}`,
  getCustomerTicket: "/api/Ticket/get-all-ticket-routes",
  getMetroScheduleByStation: (stationId: string) => `/api/TrainSchedule/station/${stationId}`,
  getTicketType: "/api/SubscriptionTicketType/all",
  getSpecialTicket: (startStationId: string, endStationId: string, ticketTypeId: string) => `/api/SubscriptionTicket/by-station/${startStationId}/${endStationId}/${ticketTypeId}`,
  createTicketSubscription: "/api/SubscriptionTicket/create-subscription-ticket",
  getQRCodeFromSubscription: (ticketId: string) => `/api/Ticket/get-qr-code/${ticketId}`,
  getAllStations : "/api/Station/get-all-stations",
};

export default endpoints;
