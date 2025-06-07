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
};

export default endpoints;
