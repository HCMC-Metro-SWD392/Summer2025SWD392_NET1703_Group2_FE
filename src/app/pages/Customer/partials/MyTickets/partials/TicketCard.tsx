import { useRef, useState, useEffect } from "react";
import { Typography, Tag, Card, message, Modal, QRCode, Tabs } from "antd";
import type { Ticket } from "../../../../../../types/types";
import { getStatusColor, getStatusLabel } from "./ticketUtils";
import logoMetro from "../../../../../assets/fpt.png";
import { getQRCodeFromSubscription } from "../../../../../../api/buyRouteTicket/buyRouteTicket";

const { Text } = Typography;
const { TabPane } = Tabs;

const TicketCard = ({
  ticket,
  status,
}: {
  ticket: Ticket;
  status: "unused" | "active" | "used";
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [countdown, setCountdown] = useState(61);
  const [activeTab, setActiveTab] = useState("1");
  const isModalVisibleRef = useRef(isModalVisible);

  const countdownRef = useRef<number | null>(null);
  const qrExpireTimeRef = useRef<number>(0);

  const isSubscription = Boolean(ticket.subscriptionTicketId);

  useEffect(() => {
    isModalVisibleRef.current = isModalVisible;
  }, [isModalVisible]);

  const startCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = window.setInterval(() => {
      const remain = Math.max(0, Math.floor((qrExpireTimeRef.current - Date.now()) / 1000));
      setCountdown(remain);

      if (remain <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;

        if (isModalVisibleRef.current && activeTab === "1") {
          fetchQRCode();
        }
      }
    }, 1000);
  };

  const fetchQRCode = async () => {

    if (!isSubscription && qrCodeValue) return;

    const stillValid = isSubscription && qrCodeValue && Date.now() < qrExpireTimeRef.current;
    if (stillValid) return;

    setLoadingQR(true);
    try {
      const data = await getQRCodeFromSubscription(ticket.id); // dùng chung API cho cả vé lượt & tháng
      console.log(data);
      const qrValue = data.result || ticket.id;
      setQrCodeValue(qrValue);

      if (isSubscription) {
        qrExpireTimeRef.current = Date.now() + 61000;
        setCountdown(61);
        startCountdown();
      }
    } catch (error) {
      message.error("Không thể lấy mã QR cho vé.");
    } finally {
      setLoadingQR(false);
    }
  };

  const handleUseTicket = () => {
    if (status === "used") {
      message.warning("Vé không còn hợp lệ để sử dụng.");
      return;
    }
    setIsModalVisible(true);
    setActiveTab("1");
    fetchQRCode(); // luôn gọi cho mọi loại vé
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === "1") {
      fetchQRCode();
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setActiveTab("1");
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <Card
        key={ticket.id}
        onClick={handleUseTicket}
        hoverable
        className="shadow-md rounded-xl border p-0 overflow-hidden max-w-2xl font-sans transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-blue-500"
        style={{ minHeight: 120 }}
      >
        <div className="grid grid-cols-[1fr_80px] gap-4 px-0 py-0">
          <div className="px-3 py-2">
            <div className="flex justify-between items-start mb-1">
              <div>
                <div className="text-cyan-800 font-bold text-base">HCMC METRO</div>
                <div className="text-xs text-gray-600 font-semibold">
                  {ticket.subscriptionTicketId ? "Vé tháng" : "Vé lượt"}
                </div>
              </div>
              <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
            </div>

            <div className="text-sm mb-1 truncate">
              <Text className="font-semibold">Tuyến:</Text>{" "}
              <span className="truncate inline-block max-w-[200px] align-bottom">
                {ticket.fromStation} → {ticket.toStation}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 text-xs mt-1">
              <div>
                <Text className="font-semibold">Ngày mua:</Text>
                <br />
                {new Date(ticket.startDate).toLocaleDateString("vi-VN")}
              </div>
              <div>
                <Text className="font-semibold">HSD:</Text>
                <br />
                {new Date(ticket.endDate).toLocaleDateString("vi-VN")}
              </div>
              <div className="col-span-2 mt-1">
                <Text className="font-semibold">Giá:</Text> {ticket.price.toLocaleString()}₫
              </div>
            </div>

            <div className="mt-2 text-[10px] italic text-gray-500">
              Bấm vào vé để sử dụng trước ngày hết hạn.
            </div>
          </div>

          <div className="bg-gray-100 border-l border-dashed flex flex-col items-center justify-center px-2 py-4">
            <div className="text-[10px] text-gray-500 mt-2 rotate-[-90deg] whitespace-nowrap tracking-widest">
              Serial : {ticket.ticketSerial}
            </div>
          </div>
        </div>
      </Card>

      <Modal open={isModalVisible} onCancel={handleCloseModal} footer={null} centered title="Sử dụng vé">
        <Tabs activeKey={activeTab} onChange={handleTabChange} centered>
          <TabPane tab="QR Code" key="1">
            <div className="flex flex-col items-center py-4">
              {loadingQR ? (
                <div className="text-center text-gray-500 text-sm">Đang tải mã QR...</div>
              ) : (
                <>
                  <QRCode
                    value={qrCodeValue || ticket.id}
                    size={180}
                    icon={logoMetro}
                    iconSize={40}
                    bordered
                  />
                  {isSubscription && (
                    <div className="mt-2 text-xs text-gray-500">
                      Mã sẽ được làm mới sau:{" "}
                      <span className="font-semibold text-black">{countdown}s</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabPane>

          <TabPane tab="Thông tin vé" key="2">
            <div className="text-sm text-left px-2 py-2">
              <p>
                <Text strong>Tuyến:</Text> {ticket.fromStation} → {ticket.toStation}
              </p>
              <p>
                <Text strong>Ngày mua:</Text>{" "}
                {new Date(ticket.startDate).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <Text strong>HSD:</Text> {new Date(ticket.endDate).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <Text strong>Giá:</Text> {ticket.price.toLocaleString()}₫
              </p>
              {ticket.id && (
                <p>
                  <Text strong>Mã vé:</Text> {ticket.id}
                </p>
              )}
              <p>
                <Text strong>Trạng thái:</Text> {getStatusLabel(status)}
              </p>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
    </>
  );
};

export default TicketCard;
