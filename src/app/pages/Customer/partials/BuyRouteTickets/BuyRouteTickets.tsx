import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  Button,
  message,
  Divider,
  Image,
  Tour,
} from "antd";
import {
  QuestionCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import type {
  Station,
  Line,
  LineStartAndEndStation,
  TicketType,
} from "../../../../../types/types";
import {
  createPaymentLink,
  createTicketRoute,
  createTicketSubcription,
  getAvailableTicketTypes,
  getMetroLines,
  getSpecialTicket,
  getStationsByMetroLine,
  getTicketRoute,
} from "../../../../../api/buyRouteTicket/buyRouteTicket";
import StepFrom from "./partials/StepFrom";
import StepTo from "./partials/StepTo";
import StepPayment from "./partials/StepPayment";
import StationTimetableChart from "./partials/StationTimetableChart";
import mapImage from "../../../../assets/HCMC_METRO_SWD391.drawio.png"

const BuyRouteTicket: React.FC = () => {
  const [lines, setLines] = useState<Line[]>([]);
  const [fromStations, setFromStations] = useState<Station[]>([]);
  const [toStations, setToStations] = useState<Station[]>([]);
  const [fromLine, setFromLine] = useState<string | null>(null);
  const [fromLineStartAndEndStation, setFromLineStartAndEndStation] =
    useState<LineStartAndEndStation | null>(null);
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toLine, setToLine] = useState<string | null>(null);
  const [toLineStartAndEndStation, setToLineStartAndEndStation] =
    useState<LineStartAndEndStation | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);
  const [loadingLines, setLoadingLines] = useState(false);
  const [loadingFromStations, setLoadingFromStations] = useState(false);
  const [loadingToStations, setLoadingToStations] = useState(false);
  const [ticketPrice, setTicketPrice] = useState<number | null>(null);
  const [ticketRouteId, setTicketRouteId] = useState<string | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [ticketType, setTicketType] = useState<
    "normal" | "student" | "monthly"
  >("normal");
  const [confirmed, setConfirmed] = useState(false);
  const [openTour, setOpenTour] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);

  const fromRef = useRef<HTMLDivElement | null>(null);
  const toRef = useRef<HTMLDivElement | null>(null);
  const infoRef = useRef(null);
  const ticketInfoRef = useRef(null);
  const ticketTypeRef = useRef(null);
  const timeFromInfoRef = useRef<HTMLDivElement | null>(null);
  const timeToInfoRef = useRef<HTMLDivElement | null>(null);
  const payRef = useRef(null);

  const selectedTicket = useMemo(
  () => ticketType === "normal" ? null : ticketTypes.find((t) => t.name === ticketType),
  [ticketType, ticketTypes]
);
  // const ticketDisplayName = ticketType === "normal" ? "Vé lượt" : selectedTicket?.displayName || "";
  // const ticketName = ticketType === "normal" ? "Vé lượt" : selectedTicket?.name || "";
  // const ticketticketEx = ticketType === "normal" ? "Vé lượt" : selectedTicket?.expiration || "";
  const ticketSubcriptionId = ticketType === "normal" ? "" : selectedTicket?.id || "";
  const ticketTypeObject: TicketType | null =
  ticketType === "normal"
    ? { id: "", name: "normal", displayName: "Vé lượt", expiration: 30 }
    : selectedTicket ?? null;

  useEffect(() => {
    const fetchLines = async () => {
      setLoadingLines(true);
      try {
        const data = await getMetroLines();
        setLines(data.result);
      } catch {
        message.error("Không thể tải danh sách tuyến.");
      } finally {
        setLoadingLines(false);
      }
    };
    fetchLines();
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

  const loadStations = async (lineId: string, isFrom: boolean) => {
    if (isFrom) {
      setLoadingFromStations(true);
      try {
        const data = await getStationsByMetroLine(lineId);
        setFromLine(lineId);
        setFromLineStartAndEndStation({
          startStation: data.result[0],
          endStation: data.result[data.result.length - 1],
        });
        setFromStation(null);
        setFromStations(data.result);
      } catch {
        message.error("Không thể tải danh sách ga.");
      } finally {
        setLoadingFromStations(false);
      }
    } else {
      setLoadingToStations(true);
      try {
        const data = await getStationsByMetroLine(lineId);
        setToLine(lineId);
        setToLineStartAndEndStation({
          startStation: data.result[0],
          endStation: data.result[data.result.length - 1],
        });
        setToStation(null);
        setToStations(data.result);
      } catch {
        message.error("Không thể tải danh sách ga.");
      } finally {
        setLoadingToStations(false);
      }
    }
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
    if (!ticketRouteId)
      return message.error("Không tìm thấy tuyến vé.");
    setLoadingPay(true);
    try {
      const res = await createPaymentLink(
        ticketType === "normal"
          ? { ticketRouteId }
          : { subscriptionTicketId: ticketRouteId }
      );
      const url = res?.result?.paymentLink?.checkoutUrl;
      if (url) window.location.href = url;
      else message.error("Không lấy được link thanh toán.");
    } catch {
      message.error("Đã xảy ra lỗi khi tạo link thanh toán.");
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
              <h2 className="text-xl font-bold text-blue-800">
                Mua Vé Tuyến Metro
              </h2>
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

            <div className="flex flex-col md:flex-row gap-8 flex-grow">
              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-semibold mb-2">Điểm đi</h3>
                  <StepFrom
                    tourRef={fromRef}
                    lines={lines}
                    fromLine={fromLine}
                    fromStations={fromStations}
                    fromStation={fromStation}
                    loadingLines={loadingLines}
                    loadingStations={loadingFromStations}
                    onLineChange={(val) => loadStations(val, true)}
                    onStationSelect={setFromStation}
                  />
                  <StationTimetableChart
                    station={fromStation}
                    startAndEndStationOfLine={fromLineStartAndEndStation}
                    tourRef={timeFromInfoRef}
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-semibold mb-2">Điểm đến</h3>
                  <StepTo
                    tourRef={toRef}
                    lines={lines}
                    toLine={toLine}
                    toStations={toStations}
                    toStation={toStation}
                    fromStation={fromStation}
                    loadingLines={loadingLines}
                    loadingStations={loadingToStations}
                    onLineChange={(val) => loadStations(val, false)}
                    onStationSelect={setToStation}
                  />
                  <StationTimetableChart
                    station={toStation}
                    startAndEndStationOfLine={toLineStartAndEndStation}
                    tourRef={timeToInfoRef}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:w-1/3 flex flex-col">
          <div className="bg-white rounded-2xl shadow-xl p-6 flex-grow flex flex-col">
            <div ref={ticketInfoRef}>
              <h3 className="text-base font-semibold mb-3 text-blue-800">
                Thông tin vé
              </h3>
              <StepPayment
                fromStation={fromStation}
                toStation={toStation}
                ticketPrice={ticketPrice}
                loadingPrice={loadingPrice}
                ticketType={ticketTypeObject}
              />
            </div>

            <div className="mt-4" ref={ticketTypeRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại vé
              </label>
              <div className="flex gap-2 flex-wrap">
                {[{ name: "normal", displayName: "Vé lượt" }, ...ticketTypes].map((item) => (
                  <Button
                    key={item.name}
                    type={ticketType === item.name ? "primary" : "default"}
                    onClick={() => setTicketType(item.name as typeof ticketType)}
                  >
                    {item.displayName}
                  </Button>
                ))}
              </div>
            </div>

            <Divider className="!my-4" />

            <div ref={infoRef}>
              <p className="text-sm text-red-600 mb-2">
                <span className="font-bold">*</span> Quý khách vui lòng kiểm
                tra thông tin trước khi thanh toán. Metro không chấp nhận hoàn
                vé trong mọi trường hợp.
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
            title: "Chọn tuyến và ga đi",
            description: "Đầu tiên, chọn tuyến metro sau đó chọn ga cho điểm đi.",
            target: () => fromRef.current!,
          },
          {
            title: "Xem thời gian tàu ghé ga đi",
            description: "Sau khi bạn chọn ga đi thì bạn có thể xem thời gian tàu ghé ga tại đây",
            target: () => timeFromInfoRef.current!,
          },
          {
            title: "Chọn tuyến và ga đến",
            description: "Tiếp theo, chọn tuyến metro và chọn ga bạn muốn đến.",
            target: () => toRef.current!,
          },
          {
            title: "Xem thời gian tàu ghé ga đến",
            description: "Sau khi bạn chọn ga đến thì bạn có thể xem thời gian tàu ghé ga tại đây",
            target: () => timeToInfoRef.current!,
          },
          {
            title: "Xem thông tin vé",
            description: "Tại đây bạn có thể xem tóm tắt thông tin vé đã chọn như tuyến, ga đi, ga đến và loại vé.",
            target: () => ticketInfoRef.current!,
          },
          {
            title: "Chọn loại vé",
            description: "Chọn loại vé thường hoặc vé ưu đãi để tiếp tục thanh toán.",
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
