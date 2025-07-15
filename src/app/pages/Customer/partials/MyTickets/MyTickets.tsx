import { message, Modal, Spin, Tabs, Typography } from "antd";
import React, { useEffect, useState } from "react";
import endpoints from "../../../../../api/endpoints";
import axiosInstance from "../../../../../settings/axiosInstance";
import type { Ticket } from "../../../../../types/types";
import TicketList from "./partials/TicketList";
import connection from "../../../../../settings/signalrConnection";
import { HubConnectionState } from "@microsoft/signalr";
import logoMetroHCMC from "../../../../assets/logo.png";


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
  const [checkinModalVisible, setCheckinModalVisible] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [total, setTotal] = useState(0);

  const loadTickets = async (status: "unused" | "active" | "used", pageNumber = 1) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.getCustomerTicket, {
        params: {
          status: statusMap[status],
          pageNumber,
          pageSize,
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
    loadTickets(activeTab, 1);
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

          connection.on("NotifyCheckinCheckout", (data) => {
            console.log("📡 Nhận NotifyCheckinCheckout:", data);
            setCheckinMessage(data.message);
            setCheckinModalVisible(true);
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

      // console.log(res.data)

      const link = res?.data?.result?.paymentLink?.checkoutUrl;
      if (link) {
        window.location.href = link;
      } else {
        // message.error("Không lấy được link thanh toán.");
      }
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
          <div className="flex justify-center">{loading ? <Spin size="large" /> : <TicketList tickets={tickets} status={activeTab} total={total}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={(page) => loadTickets(activeTab, page)} />}</div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Vé đang sử dụng" key="active">
          <div className="flex justify-center">{loading ? <Spin size="large" /> : <TicketList tickets={tickets} status={activeTab} total={total}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={(page) => loadTickets(activeTab, page)} />}</div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Vé đã sử dụng" key="used">
          <div className="flex justify-center">{loading ? <Spin size="large" /> : <TicketList tickets={tickets} status={activeTab} total={total}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={(page) => loadTickets(activeTab, page)} />}</div>
        </Tabs.TabPane>
      </Tabs>

      <Modal
        open={modalVisible}
        centered
        title={null}
        footer={null}
        onCancel={() => setModalVisible(false)}
        width={520}
        zIndex={1000}
        closable={false}
      >
        <div className="bg-[#f9fafb] rounded-xl p-6 border border-dashed border-gray-300">
          <div className="flex justify-center mb-4">
            <img src={logoMetroHCMC} alt="Metro Logo" className="h-6" />
          </div>
          <h3 className="text-lg font-semibold text-center text-red-600 mb-4">Thông báo vượt trạm</h3>
          <p className="text-gray-700 text-sm text-center mb-6">{currentNotifyData?.message}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handlePaymentConfirm}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Xác nhận
            </button>
            <button
              onClick={() => setModalVisible(false)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              Bỏ qua
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={checkinModalVisible}
        centered
        title={null}
        footer={null}
        onCancel={() => setCheckinModalVisible(false)}
        width={480}
        zIndex={1050}
        closable={false}
      >
        <div className="bg-[#f9fafb] rounded-xl p-6 border border-dashed border-gray-300">
          <div className="flex justify-center mb-4">
            <img src={logoMetroHCMC} alt="Metro Logo" className="h-6" />
          </div>
          <h3 className="text-lg font-semibold text-center text-blue-700 mb-4">Thông báo</h3>
          <p className="text-gray-700 text-sm text-center mb-6">{checkinMessage}</p>
          <div className="flex justify-center">
            <button
              onClick={() => setCheckinModalVisible(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyTickets;
