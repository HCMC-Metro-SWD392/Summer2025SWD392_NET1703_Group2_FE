import * as signalR from "@microsoft/signalr";
import { removeTokens, removeUserInfo } from "../api/auth/tokenUtils";
export const BASE_URL = import.meta.env.VITE_BASE_URL;

export const startSignalR = async () => {
  if (connection.state === signalR.HubConnectionState.Disconnected) {
    try {
      await connection.start();
      console.log("✅ SignalR started");

      connection.off("ForceLogout");
      connection.on("ForceLogout", (data) => {
        console.log("📡 Nhận ForceLogout:", data);
        removeTokens();
        removeUserInfo();
        window.location.href = "/login";
      });
    } catch (err) {
      console.error("❌ SignalR start error:", err);
    }
  }
};

const connection = new signalR.HubConnectionBuilder()
  .withUrl("https://metrohcmc.xyz/notificationHub", {
    accessTokenFactory: () => localStorage.getItem("accessToken") || ""})
  .withAutomaticReconnect()
  .build();

export default connection;

