import React, { useEffect, useState } from "react";
import {
  Card,
  Steps,
  Button,
  message,
  Select,
  Spin,
  Typography,
  // Modal,
} from "antd";
import type { Station, Line } from "../../../../../types/types";
import StationSelector from "../BuyRouteTickets/partials/StationSelector";
import {
  createPaymentLink,
  createTicketRoute,
  getMetroLines,
  getStationsByMetroLine,
  getTicketRoute,
} from "../../../../../api/buyRouteTicket/buyRouteTicket";
import logoMetro from "../../../../assets/logo.png";
// import { usePayOS } from "@payos/payos-checkout";

const { Step } = Steps;
const { Option } = Select;
const { Text } = Typography;

const BuyRouteTicket: React.FC = () => {
  const [current, setCurrent] = useState(0);

  const [lines, setLines] = useState<Line[]>([]);
  const [fromStations, setFromStations] = useState<Station[]>([]);
  const [toStations, setToStations] = useState<Station[]>([]);

  const [fromLine, setFromLine] = useState<string | null>(null);
  const [fromStation, setFromStation] = useState<Station | null>(null);

  const [toLine, setToLine] = useState<string | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);

  const [loadingLines, setLoadingLines] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);

  const [ticketPrice, setTicketPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [ticketRouteId, setTicketRouteId] = useState<string | null>(null);

  // const [isModalVisible, setIsModalVisible] = useState(false);

  // const [payOSConfig, setPayOSConfig] = useState({
  //   RETURN_URL: window.location.href,
  //   ELEMENT_ID: "embedded-payment-container",
  //   CHECKOUT_URL: null,
  //   embedded: true,
  //   onSuccess: (event: any) => {
  //     setIsModalVisible(false);
  //     message.success("Thanh toán thành công!");
  //   },
  //   onCancel: (event: any) => {
  //     //TODO: Hành động sau khi người dùng Hủy đơn hàng
  //   },
  //   onExit: (event: any) => {
  //     //TODO: Hành động sau khi người dùng tắt Pop up
  //   },
  // });

  // const { open, exit } = usePayOS(payOSConfig);

  useEffect(() => {
    const fetchLines = async () => {
      setLoadingLines(true);
      try {
        const data = await getMetroLines();
        setLines(data.result);
      } catch (error) {
        message.error("Không thể tải danh sách tuyến.");
      } finally {
        setLoadingLines(false);
      }
    };
    fetchLines();
  }, []);

  const loadStations = async (lineId: string, isFrom: boolean) => {
    setLoadingStations(true);
    try {
      const stations = await getStationsByMetroLine(lineId);
      if (isFrom) {
        setFromLine(lineId);
        setFromStation(null);
        setFromStations(stations.result);
      } else {
        setToLine(lineId);
        setToStation(null);
        setToStations(stations.result);
      }
    } catch (error) {
      message.error("Không thể tải danh sách ga.");
    } finally {
      setLoadingStations(false);
    }
  };

  const next = () => {
    if (current === 0) {
      if (!fromLine) return message.warning("Vui lòng chọn tuyến đi");
      if (!fromStation) return message.warning("Vui lòng chọn ga đi");
    }
    if (current === 1) {
      if (!toLine) return message.warning("Vui lòng chọn tuyến đến");
      if (!toStation) return message.warning("Vui lòng chọn ga đến");
    }
    setCurrent(current + 1);
  };

  const prev = () => setCurrent(current - 1);

  const handlePay = async () => {
    if (!ticketRouteId) {
      message.error("Không tìm thấy tuyến vé.");
      return;
    }

    try {
      // exit(); // đóng phiên cũ nếu có
      const res = await createPaymentLink({
        ticketRouteId,
        // codePromotion: "",
      });

      const checkoutUrl = res?.result?.paymentLink?.checkoutUrl;
      console.log(res?.result);
      if (!checkoutUrl) {
        message.error("Không lấy được link thanh toán.");
        return;
      }

      // window.location.href = checkoutUrl;

      // setPayOSConfig((prev) => ({
      //   ...prev,
      //   CHECKOUT_URL: checkoutUrl,
      // }));

      // setIsModalVisible(true);
    } catch (error) {
      console.error(error);
      message.error("Đã xảy ra lỗi khi tạo link thanh toán.");
    }
  };

  // useEffect(() => {
  //   if (payOSConfig.CHECKOUT_URL && isModalVisible) {
  //     open();
  //   }
  // }, [payOSConfig.CHECKOUT_URL, isModalVisible]);

  useEffect(() => {
    const fetchTicketPrice = async () => {
      if (current === 2 && fromStation && toStation) {
        setLoadingPrice(true);
        try {
          const response = await getTicketRoute(fromStation.id, toStation.id);
          setTicketPrice(response?.result?.price || null);
          setTicketRouteId(response?.result?.ticketRouteId || null);
        } catch (error) {
          try {
            await createTicketRoute(fromStation.id, toStation.id);
            const retryResponse = await getTicketRoute(
              fromStation.id,
              toStation.id
            );
            setTicketPrice(retryResponse?.result?.price || null);
            setTicketRouteId(retryResponse?.result?.ticketRouteId || null);
          } catch (createError) {
            message.error("Không thể lấy giá vé.");
            setTicketPrice(null);
          }
        } finally {
          setLoadingPrice(false);
        }
      }
    };

    fetchTicketPrice();
  }, [current, fromStation, toStation]);

  return (
    <div className="max-w-4xl min-h-[calc(100vh-80px)] mx-auto px-4 mt-10">
      <Card>
        <Steps current={current} className="!mb-8">
          <Step title="Chọn điểm đi" />
          <Step title="Chọn điểm đến" />
          <Step title="Thanh toán" />
        </Steps>

        {current === 0 && (
          <Spin spinning={loadingLines}>
            <div className="space-y-6">
              <div>
                <Text strong>Chọn tuyến đi:</Text>
                <Select
                  placeholder="Chọn tuyến"
                  className="w-full mt-1"
                  onChange={(val) => loadStations(val, true)}
                  value={fromLine || undefined}
                  disabled={loadingLines}
                >
                  {lines.map((line) => (
                    <Option key={line.id} value={line.id}>
                      {line.metroName}
                    </Option>
                  ))}
                </Select>
              </div>

              {fromLine && (
                <div>
                  <Text strong>Chọn ga đi:</Text>
                  <Spin spinning={loadingStations}>
                    <StationSelector
                      stations={fromStations}
                      selectedStation={fromStation}
                      onSelect={setFromStation}
                    />
                  </Spin>
                </div>
              )}
            </div>
          </Spin>
        )}

        {current === 1 && (
          <Spin spinning={loadingLines}>
            <div className="space-y-6">
              <div>
                <Text strong>Chọn tuyến đến:</Text>
                <Select
                  placeholder="Chọn tuyến"
                  className="w-full mt-1"
                  onChange={(val) => loadStations(val, false)}
                  value={toLine || undefined}
                  disabled={loadingLines}
                >
                  {lines.map((line) => (
                    <Option key={line.id} value={line.id}>
                      {line.metroName}
                    </Option>
                  ))}
                </Select>
              </div>

              {toLine && (
                <div>
                  <Text strong>Chọn ga đến:</Text>
                  <Spin spinning={loadingStations}>
                    <StationSelector
                      stations={toStations.filter(
                        (s) => s.name !== fromStation?.name
                      )}
                      selectedStation={toStation}
                      onSelect={setToStation}
                    />
                  </Spin>
                </div>
              )}
            </div>
          </Spin>
        )}

        {current === 2 && fromStation && toStation && (
          <div className="bg-[#f0f8ff] rounded-3xl shadow-2xl w-full max-w-md mx-auto p-6 relative">
            <div className="flex justify-center mb-4">
              <img src={logoMetro} alt="HURC logo" className="h-6" />
            </div>

            <div className="space-y-2 text-[15px] text-gray-800">
              <div>
                <span className="font-semibold text-blue-800">Loại vé:</span> Vé lượt
              </div>
              <div>
                <span className="font-semibold text-blue-800">HSD:</span> 30 ngày kể từ ngày mua
              </div>
              <div>
                <span className="font-semibold text-red-600">Lưu ý:</span>{" "}
                <span className="text-red-600">Vé sử dụng một lần</span>
              </div>
              <div>
                <span className="font-semibold text-blue-800">Mô tả:</span>{" "}
                {fromStation.name} – {toStation.name}
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400 my-6 relative" />

            <div className="text-center mt-6">
              {loadingPrice ? (
                <Spin size="small" />
              ) : ticketPrice !== null ? (
                <Text strong className="text-lg text-blue-800">
                  Giá vé: {ticketPrice.toLocaleString()}₫
                </Text>
              ) : (
                <Text type="danger">Không thể lấy giá vé</Text>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {current > 0 && <Button onClick={prev}>Quay lại</Button>}
          {current < 2 && (
            <Button type="primary" onClick={next}>
              Tiếp theo
            </Button>
          )}
          {current === 2 && (
            <Button
              type="primary"
              disabled={loadingPrice || !ticketRouteId}
              onClick={handlePay}
            >
              Thanh toán
            </Button>
          )}
        </div>
      </Card>

      {/* <Modal
        title="Thanh toán vé lượt"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          exit(); // đóng iframe
        }}
        footer={null}
        centered
        width={450}
      >
        <div id="embedded-payment-container" style={{ height: "350px" }} />
        <div className="text-center mt-4 text-gray-500 text-sm">
          Sau khi thanh toán thành công, vui lòng chờ vài giây để hệ thống cập nhật.
        </div>
      </Modal> */}
    </div>
  );
};

export default BuyRouteTicket;
