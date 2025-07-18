import { useEffect, useState } from 'react'
import MainRoutes from './app/routes/MainRoutes';
import { HubConnectionState } from '@microsoft/signalr';
import connection from './settings/signalrConnection';
import { removeTokens, removeUserInfo } from './api/auth/tokenUtils';

function App() {
  useEffect(() => {
    const startSignalR = async () => {
      if (connection.state === HubConnectionState.Disconnected) {
        try {
          await connection.start();
          console.log("✅ SignalR started");

          // Xóa event cũ nếu có
          connection.off("ForceLogout");

          // Đăng ký lại sự kiện
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

    const token = localStorage.getItem("accessToken");
    if (token) {
      startSignalR();
    }

    return () => {
      connection.off("ForceLogout");
    };
  }, [localStorage.getItem("accessToken")]);

  return (
    <MainRoutes />
  )
}

export default App
