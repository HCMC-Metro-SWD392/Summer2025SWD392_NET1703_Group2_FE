const endpoints = {
  login: "/api/Auth/sign-in",
  register: "/api/Auth/customer/register",
  refresh: "/auth/refresh-token",
  getUser: "/users/me",
  logout: "/auth/logout",
  weather: "https://api.openweathermap.org/data/2.5/weather",
  verifyEmail: "/api/auth/verify-email",
};

export default endpoints;
