import { message, Modal, Spin, Tabs, Typography } from "antd";
import React, { useEffect, useState } from "react";
import endpoints from "../../../../../api/endpoints";
import axiosInstance from "../../../../../settings/axiosInstance";
import type { Ticket } from "../../../../../types/types";
import TicketList from "./partials/TicketList";
import connection from "../../../../../settings/signalrConnection";
import { HubConnectionState } from "@microsoft/signalr";

const { Title } = Typography;

const statusMap: Record<"unused" | "active" | "used", number> = {
  unused: 0,
  active: 1,
  used: 2,
};

const MyTickets: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"used" | "unused" | "active">("unused");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentNotifyData, setCurrentNotifyData] = useState<{ ticketId: string; stationId: string; message: string } | null>(null);

  const loadTickets = async (status: "unused" | "active" | "used") => {
    setLoading(true);
    try {
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

  useEffect(() => {
    const startSignalR = async () => {
      if (connection.state === HubConnectionState.Disconnected) {
        try {
          await connection.start();
          console.log("✅ SignalR started");

          connection.on("NotifyOverStation", (data) => {
            console.log("📡 Nhận NotifyOverStation:", data);
            setCurrentNotifyData(data);
            setModalVisible(true);
          });
        } catch (err) {
          console.error("❌ SignalR start error:", err);
        }
      }
    };

    startSignalR();

    return () => {
      connection.off("NotifyOverStation");
    };
  }, []);

  const handlePaymentConfirm = async () => {
    if (!currentNotifyData) return;

    try {
      const res = await axiosInstance.post("/api/Payment/create-link-payment-over-station-ticket-route", {
        ticketId: currentNotifyData.ticketId,
        stationId: currentNotifyData.stationId,
      });

      console.log(res.data)

      // const link = res?.data?.result?.paymentLink?.checkoutUrl;
      // if (link) {
      //   window.location.href = link;
      // } else {
      //   message.error("Không lấy được link thanh toán.");
      // }
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      message.error("Lỗi khi tạo liên kết thanh toán.");
    } finally {
      setModalVisible(false);
    }
  };

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
          <div className="flex justify-center">{loading ? <Spin size="large" /> : <TicketList tickets={tickets} status={activeTab} />}</div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Vé đang sử dụng" key="active">
          <div className="flex justify-center">{loading ? <Spin size="large" /> : <TicketList tickets={tickets} status={activeTab} />}</div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Vé đã sử dụng" key="used">
          <div className="flex justify-center">{loading ? <Spin size="large" /> : <TicketList tickets={tickets} status={activeTab} />}</div>
        </Tabs.TabPane>
      </Tabs>

      <Modal
        open={modalVisible}
        centered
        title="Thông báo vượt trạm"
        onCancel={() => setModalVisible(false)}
        onOk={handlePaymentConfirm}
        okText="Thanh toán thêm"
        cancelText="Bỏ qua"
      >
        <p>{currentNotifyData?.message}</p>
      </Modal>
    </div>
  );
};

export default MyTickets;
