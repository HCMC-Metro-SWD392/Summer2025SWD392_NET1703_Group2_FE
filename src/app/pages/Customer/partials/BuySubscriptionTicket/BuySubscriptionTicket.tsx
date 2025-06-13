import React, { useEffect, useState } from "react";
import { Typography, Button, message, Spin } from "antd";
import { IdcardOutlined } from "@ant-design/icons";
import logoMetro from "../../../../assets/logo.png";
import axiosInstance from "../../../../../settings/axiosInstance";
import { createPaymentLink } from "../../../../../api/buyRouteTicket/buyRouteTicket";

const { Title, Text } = Typography;

type Ticket = {
  id: string;
  ticketName: string;
  ticketType: number;
  expiration: number;
  price: number;
  note?: string;
};

const BuySubscriptionTicket: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/SubcriptionTicket/all");
      setTickets(response.data.result);
    } catch (error) {
      console.error("Lỗi khi tải vé:", error);
      message.error("Không thể tải danh sách vé. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleBuy = async (ticket: Ticket) => {
    setLoadingId(ticket.id);
    try {
      const res = await createPaymentLink({ subscriptionTicketId:  ticket.id });

      const checkoutUrl = res?.result?.paymentLink?.checkoutUrl;
      if (!checkoutUrl) {
        message.error("Không lấy được link thanh toán.");
        return;
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Lỗi khi tạo link thanh toán:", error);
      message.error("Không thể tạo liên kết thanh toán.");
    //   message.error(error.data.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-[#f9fafb] min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-6">
          <img src={logoMetro} alt="Metro Logo" className="h-10" />
        </div>

        <Title level={3} className="text-center mb-10 text-blue-700">
          Mua Vé Định Kỳ Metro
        </Title>

        <Spin spinning={loading} size="large">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
              >
                {/* Icon */}
                <div className="text-3xl text-center mb-3 text-gray-600">
                  <IdcardOutlined />
                </div>

                {/* Nội dung chính */}
                <div className="flex-grow flex flex-col items-center text-center mb-4">
                  <Text className="text-base font-semibold text-gray-800 mb-1">
                    {ticket.ticketName}
                  </Text>
                  <p className="text-sm text-gray-500">{ticket.expiration} ngày hiệu lực</p>
                  <p className="mt-1 text-blue-700 font-bold text-base">
                    {ticket.price.toLocaleString()}₫
                  </p>

                  <div className="mt-4 w-full border border-dashed border-gray-400 rounded-lg p-3 text-left text-sm text-gray-700 space-y-2 min-h-[128px]">
                    <p>
                      <span className="mr-1">⏳</span>
                      <strong>Hiệu lực:</strong> {ticket.expiration} ngày kể từ ngày kích hoạt
                    </p>
                    <p>
                      <span className="mr-1">💰</span>
                      <strong>Giá:</strong> {ticket.price.toLocaleString()}₫
                    </p>
                    {ticket.note && (
                      <p className="text-red-500 font-medium text-xs">* {ticket.note}</p>
                    )}
                  </div>
                </div>

                {/* Nút mua */}
                <Button
                  type="primary"
                  size="middle"
                  block
                  className="rounded-xl"
                  loading={loadingId === ticket.id}
                  onClick={() => handleBuy(ticket)}
                >
                  Mua vé
                </Button>
              </div>
            ))}
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default BuySubscriptionTicket;
