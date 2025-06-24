import * as signalR from "@microsoft/signalr";
export const BASE_URL = import.meta.env.VITE_BASE_URL;

const connection = new signalR.HubConnectionBuilder()
  .withUrl(BASE_URL + "/NotificationHub", {
    accessTokenFactory: () => localStorage.getItem("accessToken") || "",})
  .withAutomaticReconnect()
  .build();

export default connection;
