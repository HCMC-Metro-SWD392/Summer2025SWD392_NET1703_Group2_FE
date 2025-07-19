import { useRef, useState, useEffect } from "react";
import {
  Typography,
  Tag,
  Card,
  message,
  Modal,
  QRCode,
  Tabs,
  Space,
  Spin,
  type QRCodeProps,
} from "antd";
import type { Ticket } from "../../../../../../types/types";
import { getStatusColor, getStatusLabel } from "./ticketUtils";
import logoMetro from "../../../../../assets/fpt.png";
import logoMetroHCMC from "../../../../../assets/logo.png";
import { getQRCodeFromSubscription } from "../../../../../../api/buyRouteTicket/buyRouteTicket";
import { ClockCircleOutlined } from "@ant-design/icons";
import TicketUsageHistory from "./TicketUsageHistory";

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
  const [isFullScreenQRVisible, setIsFullScreenQRVisible] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [countdown, setCountdown] = useState(61);
  const [activeTab, setActiveTab] = useState(status === "used" ? "2" : "1");
  const [historyReloadCount, setHistoryReloadCount] = useState(0);

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
      const data = await getQRCodeFromSubscription(ticket.id);
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
    // if (status === "used") {
    //   message.warning("Vé không còn hợp lệ để sử dụng.");
    //   return;
    // }
    setIsModalVisible(true);
    setActiveTab(status === "used" ? "2" : "1");
    fetchQRCode();
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === "1") {
      fetchQRCode();
    } else if (key === "3") {
      setHistoryReloadCount((prev) => prev + 1);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setActiveTab("1");
  };

  const customStatusRender: QRCodeProps["statusRender"] = (info) => {
    switch (info.status) {
      case "loading":
        return (
          <Space direction="vertical">
            <Spin />
            <p>Loading...</p>
          </Space>
        );
      default:
        return null;
    }
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
              <Text className="font-semibold">Tuyến chính:</Text>{" "}
              {ticket.subscriptionTicketId ? (
                <span className="truncate inline-block max-w-[200px] align-bottom">
                  {ticket.fromStationSub} → {ticket.toStationSub}
                </span>
              ) : (
                <span className="truncate inline-block max-w-[200px] align-bottom">
                  {ticket.fromStationRoute} → {ticket.toStationRoute}
                </span>
              )}
            </div>

            {ticket.subscriptionTicketId && ticket.ticketRouteId && (
              <div className="text-sm mb-1 truncate">
                <Text className="font-semibold">Tuyến tích hợp:</Text>{" "}
                <span className="truncate inline-block max-w-[200px] align-bottom">
                  {ticket.fromStationRoute} → {ticket.toStationRoute}
                </span>
              </div>
            )}

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

      <Modal open={isModalVisible} onCancel={handleCloseModal} footer={null} centered title="Sử dụng vé" width={420}>
        <Tabs activeKey={activeTab} onChange={handleTabChange} centered>
          {status !== "used" && (
            <TabPane tab="QR Code" key="1">
              <div className="bg-[#f9fafb] rounded-xl p-6 border border-dashed border-gray-300">
                <div className="flex justify-center mb-4">
                  <img src={logoMetroHCMC} alt="Metro Logo" className="h-6" />
                </div>
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
                        onClick={() => setIsFullScreenQRVisible(true)}
                        style={{ cursor: "pointer" }}
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
              </div>
            </TabPane>)}

          <TabPane tab="Thông tin vé" key="2">
            <div className="bg-[#f9fafb] rounded-xl p-6 border border-dashed border-gray-300">
              <div className="flex justify-center mb-4">
                <img src={logoMetroHCMC} alt="Metro Logo" className="h-6" />
              </div>

              <div className="text-sm grid gap-2">

                <div className="flex justify-between">
                  <Text strong className="text-gray-600">Số serial:</Text>
                  <span>{ticket.ticketSerial}</span>
                </div>

                  {ticket.subscriptionTicketId && ticket.subscriptionTicketId ? (
                    <>
                    <div className="flex justify-between">
                      <Text strong className="text-gray-600">Tuyến chính :</Text>
                      <span>{ticket.fromStationSub} → {ticket.toStationSub}</span>
                    </div>

                    <div className="flex justify-between">
                      <Text strong className="text-gray-600">Tuyến tích hợp :</Text>
                      <span>{ticket.fromStationSub} → {ticket.toStationSub}</span>
                    </div>
                    </>
                    
                  ) : (
                    <div className="flex justify-between">
                      <Text strong className="text-gray-600">Tuyến chính :</Text>
                      <span>{ticket.fromStationRoute} → {ticket.toStationRoute}</span>
                    </div>
                  )}

                <div className="flex justify-between">
                  <Text strong className="text-gray-600">Ngày mua:</Text>
                  <span>{new Date(ticket.startDate).toLocaleDateString("vi-VN")}</span>
                </div>

                <div className="flex justify-between">
                  <Text strong className="text-gray-600">HSD:</Text>
                  <span>{new Date(ticket.endDate).toLocaleDateString("vi-VN")}</span>
                </div>

                <div className="flex justify-between">
                  <Text strong className="text-gray-600">Giá:</Text>
                  <span>{ticket.price.toLocaleString()}₫</span>
                </div>

                <div className="flex justify-between items-center">
                  <Text strong className="text-gray-600">Trạng thái:</Text>
                  <Tag color={getStatusColor(status)} className="!m-0">
                    {getStatusLabel(status)}
                  </Tag>
                </div>
              </div>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <ClockCircleOutlined /> Lịch sử sử dụng
              </span>
            }
            key="3"
          >
            <TicketUsageHistory ticketId={ticket.id} reloadTrigger={historyReloadCount} />
          </TabPane>
        </Tabs>
      </Modal>

      {/* Modal fullscreen QR */}
      <Modal
        open={isFullScreenQRVisible}
        onCancel={() => setIsFullScreenQRVisible(false)}
        footer={null}
        centered
        closable
        style={{ top: 0, padding: 0 }}
        bodyStyle={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <QRCode
          value={qrCodeValue || ticket.id}
          size={320}
          icon={logoMetro}
          iconSize={60}
          bordered
        />
      </Modal>
    </>
  );
};

export default TicketCard;
