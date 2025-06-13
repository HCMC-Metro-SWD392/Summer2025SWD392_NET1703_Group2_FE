import { useEffect, useState } from "react";
import { getWeather } from "../../../api/home/homeApi";
import backgroundHcmCity from "../../assets/backgroundhcmcity.png";


const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const CITY_NAME = "Ho Chi Minh";

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [temperature, setTemperature] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getWeather(CITY_NAME, API_KEY)
      .then((temp) => {
        setTemperature(temp);
      })
      .catch((err) => {
        
      });
  }, []);

  const now = time.toLocaleTimeString();
  const today = time.toDateString();

  return (
    <div
      className="min-h-[calc(100vh-120px)] bg-cover bg-center text-white flex flex-col items-center justify-center"
      style={{
        backgroundImage: `url(${backgroundHcmCity})`,
      }}
    >
      <h1 className="text-5xl font-bold text-white text-center drop-shadow-md">
        Welcome to HCMC Metro
      </h1>
      <p className="mt-4 text-lg text-white text-center bg-black/40 px-4 py-2 rounded-md inline-block">
        {today} | {now}
      </p>

      {/* Weather */}
      <div className="mt-2 text-white text-center text-shadow">
        <span>
          🌡{" "}
          {temperature !== null
            ? `${(temperature * 1).toFixed(1)}°C / ${(temperature * 1.8 + 32).toFixed(0)}°F`
            : "Đang tải..."}
        </span>
        <span> Ho Chi Minh City</span>
      </div>
    </div>
  );
}
