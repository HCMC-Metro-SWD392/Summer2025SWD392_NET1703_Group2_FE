import { Spin, Tabs, Typography } from "antd";
import React, { useEffect, useState } from "react";
import endpoints from "../../../../../api/endpoints";
import axiosInstance from "../../../../../settings/axiosInstance";
import type { Ticket } from "../../../../../types/types";
import TicketList from "./partials/TicketList";

const { Title } = Typography;

// const sampleData: Record<string, Ticket[]> = {
//   unused: [
//     {
//       id: "1",
//       fromStation: "Ga A",
//       toStation: "Ga B",
//       price: 15000,
//       status: "unused",
//       createdAt: "2024-06-01T10:00:00Z",
//       expirationDate: "2024-06-30",
//     },
//   ],
//   active: [
//     {
//       id: "2",
//       fromStation: "Ga C",
//       toStation: "Ga D",
//       price: 18000,
//       status: "active",
//       createdAt: "2024-06-04T10:00:00Z",
//       expirationDate: "2024-06-30",
//     },
//     {
//       id: "2",
//       fromStation: "Ga C",
//       toStation: "Ga D",
//       price: 18000,
//       status: "active",
//       createdAt: "2024-06-04T10:00:00Z",
//       expirationDate: "2024-06-30",
//     },
//     {
//       id: "2",
//       fromStation: "Ga C",
//       toStation: "Ga D",
//       price: 18000,
//       status: "active",
//       createdAt: "2024-06-04T10:00:00Z",
//       expirationDate: "2024-06-30",
//     },
//   ],
//   used: [
//     {
//       id: "3",
//       fromStation: "Ga E",
//       toStation: "Ga F",
//       price: 20000,
//       status: "used",
//       createdAt: "2024-05-20T10:00:00Z",
//       expirationDate: "2024-06-01",
//     },
//   ],
// };

const statusMap: Record<"unused" | "active" | "used", number> = {
  unused: 0,
  active: 1,
  used: 2,
};

const MyTickets: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"used" | "unused" | "active">("unused");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const loadTickets = async (status: "unused" | "active" | "used") => {
    setLoading(true);
    try {
      // Tạm dùng data mẫu
      // await new Promise((res) => setTimeout(res, 500)); // Giả lập delay
      // setTickets(sampleData[status] || []);

      // Sau này bật API:
      const response = await axiosInstance.get(endpoints.getCustomerTicket, {
        params: {
        status: statusMap[status],
      },
      });
      setTickets(response.data.result || []);
    } catch (err) {
      console.error("Lỗi tải vé:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets(activeTab);
  }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 min-h-[calc(100vh-80px)]">
      <Title level={3} className="mb-6 text-center text-blue-800">Vé của tôi</Title>
      <Tabs
        defaultActiveKey="unused"
        size="large"
        type="line"
        animated
        onChange={(key) => setActiveTab(key as "active" | "unused" | "used")}
      >
        <Tabs.TabPane tab="Vé chưa sử dụng" key="unused">
          <div className="flex justify-center">{loading ? <Spin size="large" /> : <TicketList tickets={tickets} status={activeTab as "unused" | "active" | "used"} />}</div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Vé đang sử dụng" key="active">
          <div className="flex justify-center">{loading ? <Spin size="large" /> : <TicketList tickets={tickets} status={activeTab as "unused" | "active" | "used"} />}</div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Vé đã sử dụng" key="used">
          <div className="flex justify-center">{loading ? <Spin size="large" /> : <TicketList tickets={tickets} status={activeTab as "unused" | "active" | "used"}/>}</div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default MyTickets;
