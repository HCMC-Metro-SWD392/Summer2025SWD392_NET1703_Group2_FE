import React, { useEffect, useState } from "react";
import { Spin, message } from "antd";
import { MetroRouteModal } from "./MetroRouteModal";
import axiosInstance from "../../../../../../settings/axiosInstance";

interface Props {
  stationStart?: string;
  stationEnd?: string;
  routeId?: string;
  open: boolean;
  onClose: () => void;
}

export const ViewRouteFetcher: React.FC<Props> = ({
  stationStart,
  stationEnd,
  routeId,
  open,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!open) return;
      setLoading(true);

      try {
        let res;

        if (routeId) {
          // 📌 Gọi API theo routeId
          res = await axiosInstance.get("/api/Station/search-ticket-road-v2", {
            params: { ticketId: routeId },
          });
        } else if (stationStart && stationEnd) {
          // 📌 Gọi API theo 2 ga
          res = await axiosInstance.get("/api/Station/search-ticket-road", {
            params: { stationStart, stationEnd },
          });
        } else {
          message.warning("Thiếu thông tin để tìm đường đi.");
          return;
        }

        if (res.data?.isSuccess) {
          setRouteData(res.data.result);
        } else {
          message.error(res.data?.message || "Không tìm được đường đi.");
        }
      } catch (err) {
        console.error("Lỗi gọi API:", err);
        message.error("Gọi API thất bại!");
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [stationStart, stationEnd, routeId, open]);

  return (
    <>
      {loading && open && <Spin tip="Đang tìm đường đi..." />}
      {routeData && (
        <MetroRouteModal open={open} onClose={onClose} data={routeData} />
      )}
    </>
  );
};
