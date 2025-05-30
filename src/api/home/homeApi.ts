import endpoints from "../endpoints";

import axios from "axios";

export const getWeather = async (
  cityName: string,
  apiKey: string
) => {
 try {
    const res = await axios.get(endpoints.weather, {
      params: {
        q: cityName,
        appid: apiKey,
        units: "metric",
      },
    });
    return res.data.main.temp;
  } catch (error) {
    console.error("Lỗi lấy thời tiết:", error);
    throw error;
  }
};