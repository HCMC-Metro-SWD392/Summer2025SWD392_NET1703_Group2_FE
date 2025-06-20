import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  Button,
  message,
  Divider,
  Image,
  Tour,
  AutoComplete,
  Spin,
  Input,
} from "antd";
import {
  QuestionCircleOutlined,
  EnvironmentOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import type {
  Station,
  TicketType,
} from "../../../../../types/types";
import {
  createPaymentLink,
  createTicketRoute,
  createTicketSubcription,
  getAvailableTicketTypes,
  getSpecialTicket,
  getTicketRoute,
  getAllStations,
} from "../../../../../api/buyRouteTicket/buyRouteTicket";
import StepPayment from "./partials/StepPayment";
import StationTimetableChart from "./partials/StationTimetableChart";
import mapImage from "../../../../assets/HCMC_METRO_SWD391.drawio.png";
import { removeVietnameseTones } from "../../../../utils/string";
import { TicketIcon } from "lucide-react";

const BuyRouteTicket: React.FC = () => {
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);
  const [searchingStation, setSearchingStation] = useState(false);
  const [ticketPrice, setTicketPrice] = useState<number | null>(null);
  const [ticketRouteId, setTicketRouteId] = useState<string | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [ticketType, setTicketType] = useState<"normal" | "student" | "monthly">("normal");
  const [confirmed, setConfirmed] = useState(false);
  const [openTour, setOpenTour] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [promotionCode, setPromotionCode] = useState<string>("");

  const fromRef = useRef<HTMLDivElement | null>(null);
  const toRef = useRef<HTMLDivElement | null>(null);
  const infoRef = useRef(null);
  const ticketInfoRef = useRef(null);
  const ticketTypeRef = useRef(null);
  const timeFromInfoRef = useRef<HTMLDivElement | null>(null);
  const timeToInfoRef = useRef<HTMLDivElement | null>(null);
  const payRef = useRef(null);

  const selectedTicket = useMemo(() =>
    ticketType === "normal" ? null : ticketTypes.find((t) => t.name === ticketType),
    [ticketType, ticketTypes]
  );

  const ticketSubcriptionId = ticketType === "normal" ? "" : selectedTicket?.id || "";
  const ticketTypeObject: TicketType | null =
    ticketType === "normal"
      ? { id: "", name: "normal", displayName: "Vé lượt", expiration: 30 }
      : selectedTicket ?? null;

  useEffect(() => {
    const fetchAllStations = async () => {
      setSearchingStation(true);
      try {
        const res = await getAllStations();
        setAllStations(res.result);
      } catch {
        message.error("Không thể tải danh sách ga.");
      } finally {
        setSearchingStation(false);
      }
    };
    fetchAllStations();
  }, []);

  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
        const res = await getAvailableTicketTypes();
        setTicketTypes(res.result);
      } catch {
        message.error("Không thể tải các loại vé.");
      }
    };
    fetchTicketTypes();
  }, []);

  // const stationOptions = useMemo(() =>
  //   allStations.map((station) => ({
  //     value: station.name,
  //     label: station.name,
  //   })), [allStations]
  // );

  const fromStationOptions = useMemo(() =>
    allStations
      .filter((station) => !toStation || station.id !== toStation.id)
      .map((station) => ({ value: station.name, label: station.name })),
    [allStations, toStation]
  );

  const toStationOptions = useMemo(() =>
    allStations
      .filter((station) => !fromStation || station.id !== fromStation.id)
      .map((station) => ({ value: station.name, label: station.name })),
    [allStations, fromStation]
  );

  const findStationByName = (name: string): Station | null => {
    const normalizedName = removeVietnameseTones(name.toLowerCase());
    return (
      allStations.find(
        (station) =>
          removeVietnameseTones(station.name.toLowerCase()) === normalizedName
      ) || null
    );
  };

  useEffect(() => {
    const fetchPrice = async () => {
      if (fromStation && toStation) {
        setLoadingPrice(true);
        try {
          if (ticketType === "normal") {
            const data = await getTicketRoute(fromStation.id, toStation.id);
            setTicketPrice(data?.result?.price || null);
            setTicketRouteId(data?.result?.ticketRouteId || null);
          } else {
            const res = await getSpecialTicket(
              fromStation.id,
              toStation.id,
              ticketSubcriptionId
            );
            setTicketPrice(res?.result?.price || null);
            setTicketRouteId(res?.result?.id || null);
          }
        } catch {
          try {
            if (ticketType === "normal") {
              await createTicketRoute(fromStation.id, toStation.id);
              const retry = await getTicketRoute(fromStation.id, toStation.id);
              setTicketPrice(retry?.result?.price || null);
              setTicketRouteId(retry?.result?.ticketRouteId || null);
            } else {
              await createTicketSubcription(
                ticketSubcriptionId,
                fromStation.id,
                toStation.id
              );
              const retry = await getSpecialTicket(
                fromStation.id,
                toStation.id,
                ticketSubcriptionId
              );
              setTicketPrice(retry?.result?.price || null);
              setTicketRouteId(retry?.result?.id || null);
            }
          } catch {
            message.error("Không thể lấy giá vé.");
          }
        } finally {
          setLoadingPrice(false);
        }
      } else {
        setTicketPrice(null);
        setTicketRouteId(null);
      }
    };
    fetchPrice();
  }, [fromStation, toStation, ticketType]);

  const handlePay = async () => {
    if (!ticketRouteId) return message.error("Không tìm thấy tuyến vé.");
    setLoadingPay(true);
    try {
      const res = await createPaymentLink(
        ticketType === "normal"
          ? { ticketRouteId, codePromotion: promotionCode }
          : { subscriptionTicketId: ticketRouteId, codePromotion: promotionCode }
      );
      const url = res?.result?.paymentLink?.checkoutUrl;
      if (url) window.location.href = url;
      else message.error("Không lấy được link thanh toán.");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Đã xảy ra lỗi khi tạo link thanh toán.";
      message.error(errorMessage);
    } finally {
      setLoadingPay(false);
    }
  };

  return (
    <div className="bg-[#f0f8ff] min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-stretch gap-6">
        <div className="flex-1 flex flex-col">
          <Card className="!rounded-2xl !shadow-xl flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-blue-800">Mua Vé Tuyến Metro</h2>
              <div className="flex items-center gap-2">
                <Button
                  icon={<EnvironmentOutlined />}
                  shape="circle"
                  onClick={() => setPreviewOpen(true)}
                  title="Xem bản đồ tuyến"
                />
                <Button
                  icon={<QuestionCircleOutlined />}
                  shape="circle"
                  onClick={() => setOpenTour(true)}
                  title="Hướng dẫn sử dụng"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
              <div>
                <h3 className="text-base font-semibold mb-2">Ga đi</h3>
                <div ref={fromRef}>
                  <AutoComplete
                    className="w-full"
                    options={fromStationOptions}
                    placeholder="Chọn ga đi"
                    onChange={(value) => setFromStation(findStationByName(value))}
                    filterOption={(input, option) => {
                      const normalizedInput = removeVietnameseTones(input.toLowerCase());
                      const normalizedOption = removeVietnameseTones(option?.value.toLowerCase() || "");
                      return normalizedOption.includes(normalizedInput);
                    }}
                  />
                </div>
                <StationTimetableChart
                  station={fromStation}
                  startAndEndStationOfLine={null}
                  tourRef={timeFromInfoRef}
                />
              </div>

              <div>
                <h3 className="text-base font-semibold mb-2">Ga đến</h3>
                <div ref={toRef}>
                  <AutoComplete
                    className="w-full"
                    options={toStationOptions}
                    placeholder="Chọn ga đến"
                    onChange={(value) => setToStation(findStationByName(value))}
                    filterOption={(input, option) => {
                      const normalizedInput = removeVietnameseTones(input.toLowerCase());
                      const normalizedOption = removeVietnameseTones(option?.value.toLowerCase() || "");
                      return normalizedOption.includes(normalizedInput);
                    }}
                  />
                </div>
                <StationTimetableChart
                  station={toStation}
                  startAndEndStationOfLine={null}
                  tourRef={timeToInfoRef}
                />
              </div>
            </div>

            <Divider className="!my-4" />


            <label className="block text-sm font-medium text-gray-700 mb-2">Loại vé</label>
            <div className="grid grid-cols-2 gap-3 relative" ref={ticketTypeRef}>
              {[{ name: "normal", displayName: "Vé lượt" }, ...ticketTypes].map((item) => {
                const isSelected = ticketType === item.name;
                return (
                  <div
                    key={item.name}
                    onClick={() => setTicketType(item.name as typeof ticketType)}
                    className={`relative cursor-pointer rounded-2xl border p-4 flex items-center gap-3 transition-all hover:shadow-lg ${isSelected
                        ? "border-blue-600 bg-blue-50 shadow-lg"
                        : "border-gray-300 bg-white"
                      }`}
                  >
                    <div className="text-blue-600 text-2xl">
                      <TicketIcon />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {item.displayName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.name === "normal" ? "Thanh toán từng lượt" : "Vé ưu đãi"}
                      </div>
                    </div>

                    {/* Tick xanh khi được chọn */}
                    {isSelected && (
                      <CheckCircleFilled className="absolute top-2 right-2 !text-green-500 text-lg" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="md:w-1/3 flex flex-col">
          <div className="bg-white rounded-2xl shadow-xl p-6 flex-grow flex flex-col">
            <div ref={ticketInfoRef}>
              <h3 className="text-base font-semibold mb-3 text-blue-800">Thông tin vé</h3>
              <StepPayment
                fromStation={fromStation}
                toStation={toStation}
                ticketPrice={ticketPrice}
                loadingPrice={loadingPrice}
                ticketType={ticketTypeObject}
              />
            </div>


            <div className="mt-4" ref={ticketTypeRef}>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã khuyến mãi (nếu có)</label>
                <Input
                  placeholder="Nhập mã khuyến mãi"
                  value={promotionCode}
                  onChange={(e) => setPromotionCode(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <Divider className="!my-4" />

            <div ref={infoRef}>
              <p className="text-sm text-red-600 mb-2">
                <span className="font-bold">*</span> Vui lòng kiểm tra thông tin kỹ trước khi thanh toán. Vé đã mua không hoàn.
              </p>
              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                <span className="text-sm text-gray-700">
                  Tôi đã kiểm tra thông tin và xác nhận thanh toán
                </span>
              </label>
            </div>

            <div className="mt-4" ref={payRef}>
              <Button
                type="primary"
                size="large"
                disabled={!ticketRouteId || loadingPrice || !confirmed}
                loading={loadingPay}
                onClick={handlePay}
                className="!w-full"
              >
                Thanh toán
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tour
        open={openTour}
        onClose={() => setOpenTour(false)}
        steps={[
          {
            title: "Chọn ga đi",
            description: "Chọn ga bạn muốn đi từ danh sách.",
            target: () => fromRef.current!,
          },
          {
            title: "Xem thời gian tàu ghé ga đi",
            description: "Sau khi bạn chọn ga đi thì bạn có thể xem thời gian tàu ghé ga tại đây.",
            target: () => timeFromInfoRef.current!,
          },
          {
            title: "Chọn ga đến",
            description: "Tiếp theo, chọn ga bạn muốn đến.",
            target: () => toRef.current!,
          },
          {
            title: "Xem thời gian tàu ghé ga đến",
            description: "Sau khi bạn chọn ga đến thì bạn có thể xem thời gian tàu ghé ga tại đây.",
            target: () => timeToInfoRef.current!,
          },
          {
            title: "Xem thông tin vé",
            description: "Tại đây bạn có thể xem tóm tắt thông tin vé đã chọn như ga đi, ga đến và loại vé.",
            target: () => ticketInfoRef.current!,
          },
          {
            title: "Chọn loại vé",
            description: "Chọn loại vé lượt hoặc vé ưu đãi để tiếp tục.",
            target: () => ticketTypeRef.current!,
          },
          {
            title: "Xác nhận thanh toán",
            description: "Kiểm tra kỹ thông tin trước khi thanh toán.",
            target: () => infoRef.current!,
          },
          {
            title: "Thanh toán",
            description: "Sau khi kiểm tra thông tin thì bạn đã có thể thanh toán.",
            target: () => payRef.current!,
          },
        ]}
      />

      <Image
        wrapperStyle={{ display: "none" }}
        preview={{
          visible: previewOpen,
          onVisibleChange: (visible) => setPreviewOpen(visible),
          afterOpenChange: (visible) => !visible,
        }}
        src={mapImage}
      />
    </div>
  );
};

export default BuyRouteTicket;
