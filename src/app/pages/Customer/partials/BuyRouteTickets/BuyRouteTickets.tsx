import React, { useEffect, useState } from "react";
import { Card, Button, message, Divider } from "antd";
import type { Station, Line, LineStartAndEndStation } from "../../../../../types/types";
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
import { Select } from "antd";
const { Option } = Select;

const BuyRouteTicket: React.FC = () => {
  const [lines, setLines] = useState<Line[]>([]);
  const [fromStations, setFromStations] = useState<Station[]>([]);
  const [toStations, setToStations] = useState<Station[]>([]);
  const [fromLine, setFromLine] = useState<string | null>(null);
  const [fromLineStartAndEndStation, setFromLineStartAndEndStation] = useState<LineStartAndEndStation | null>(null);
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toLine, setToLine] = useState<string | null>(null);
  const [toLineStartAndEndStation, setToLineStartAndEndStation] = useState<LineStartAndEndStation | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);
  const [loadingLines, setLoadingLines] = useState(false);
  const [loadingFromStations, setLoadingFromStations] = useState(false);
  const [loadingToStations, setLoadingToStations] = useState(false);
  const [ticketPrice, setTicketPrice] = useState<number | null>(null);
  const [ticketRouteId, setTicketRouteId] = useState<string | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<
    { id: string; name: string; displayName: string; expiration: number }[]
  >([]);
  const [ticketType, setTicketType] = useState<"normal" | "student" | "monthly">("normal");

  const selectedTicket =
  ticketType === "normal"
    ? null
    : ticketTypes.find((t) => t.name === ticketType);

const ticketDisplayName = ticketType === "normal" ? "Vé lượt" : selectedTicket?.displayName || "";
const ticketSubcriptionId = ticketType === "normal" ? "" : selectedTicket?.id || "";



  // Load metro lines
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
  // Load stations by line
  const loadStations = async (lineId: string, isFrom: boolean) => {
    if (isFrom) {
      setLoadingFromStations(true);
      try {
        const data = await getStationsByMetroLine(lineId);
        setFromLine(lineId);
        setFromLineStartAndEndStation({ startStation: data.result[0], endStation: data.result[data.result.length - 1]});
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
        setToLineStartAndEndStation({ startStation: data.result[0], endStation: data.result[data.result.length - 1]});
        setToStation(null);
        setToStations(data.result);
      } catch {
        message.error("Không thể tải danh sách ga.");
      } finally {
        setLoadingToStations(false);
      }
    }
  };

  // Fetch ticket price when both stations are selected
  useEffect(() => {
    const fetchPrice = async () => {
      if (fromStation && toStation) {
        setLoadingPrice(true);
        try {
          // const data = await getTicketRoute(fromStation.id, toStation.id);
          // setTicketPrice(data?.result?.price || null);
          // setTicketRouteId(data?.result?.ticketRouteId || null);

          if (ticketType === "normal") {
            const data = await getTicketRoute(fromStation.id, toStation.id);
            setTicketPrice(data?.result?.price || null);
            setTicketRouteId(data?.result?.ticketRouteId || null);
          } else {
            // Gọi API lấy vé theo loại đặc biệt
            const res = await getSpecialTicket(fromStation.id, toStation.id, ticketSubcriptionId);
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
              await createTicketSubcription(ticketSubcriptionId ,fromStation.id, toStation.id);
              const retry = await getSpecialTicket(fromStation.id, toStation.id, ticketSubcriptionId);
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
      const res = await createPaymentLink(ticketType === "normal" ? { ticketRouteId } : { subscriptionTicketId: ticketRouteId });
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
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Form chọn ga bên trái */}
        <div className="flex-1">
          <Card className="rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold mb-6 text-center text-blue-800">
              Mua Vé Tuyến Metro
            </h2>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Cột trái: Điểm đi */}
              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-semibold mb-2">Điểm đi</h3>
                  <StepFrom
                    lines={lines}
                    fromLine={fromLine}
                    fromStations={fromStations}
                    fromStation={fromStation}
                    loadingLines={loadingLines}
                    loadingStations={loadingFromStations}
                    onLineChange={(val) => loadStations(val, true)}
                    onStationSelect={setFromStation}
                  />
                  <StationTimetableChart stationId={fromStation?.id} startAndEndStationOfLine={fromLineStartAndEndStation} />
                </div>
              </div>

              {/* Cột phải: Điểm đến */}
              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-semibold mb-2">Điểm đến</h3>
                  <StepTo
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
                  <StationTimetableChart stationId={toStation?.id} startAndEndStationOfLine={toLineStartAndEndStation} />

                </div>
              </div>
            </div>

          </Card>
        </div>

        <div className="md:w-1/3">
          <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-6 sticky top-10">
            <h3 className="text-base font-semibold mb-3 text-blue-800">Thông tin vé</h3>
            <StepPayment
              fromStation={fromStation}
              toStation={toStation}
              ticketPrice={ticketPrice}
              loadingPrice={loadingPrice}
              ticketDisplayName={ticketDisplayName}
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại vé
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { name: "normal", displayName: "Vé lượt" },
                  ...ticketTypes,
                ].map((item) => (
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
            <Divider />
            <div className="mt-6 text-right">
              <Button
                type="primary"
                size="large"
                disabled={!ticketRouteId || loadingPrice}
                loading={loadingPay}
                onClick={handlePay}
              >
                Thanh toán
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BuyRouteTicket;
