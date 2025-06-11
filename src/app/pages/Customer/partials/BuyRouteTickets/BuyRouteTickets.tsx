import React, { useEffect, useState } from "react";
import { Card, Steps, Button, message } from "antd";
import type { Station, Line } from "../../../../../types/types";
import {
  createPaymentLink,
  createTicketRoute,
  getMetroLines,
  getStationsByMetroLine,
  getTicketRoute,
} from "../../../../../api/buyRouteTicket/buyRouteTicket";
import StepFrom from "./partials/StepFrom";
import StepTo from "./partials/StepTo";
import StepPayment from "./partials/StepPayment";

const { Step } = Steps;

const BuyRouteTicket: React.FC = () => {
  const [current, setCurrent] = useState(0);

  // State
  const [lines, setLines] = useState<Line[]>([]);
  const [fromStations, setFromStations] = useState<Station[]>([]);
  const [toStations, setToStations] = useState<Station[]>([]);
  const [fromLine, setFromLine] = useState<string | null>(null);
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toLine, setToLine] = useState<string | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);
  const [loadingLines, setLoadingLines] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [ticketPrice, setTicketPrice] = useState<number | null>(null);
  const [ticketRouteId, setTicketRouteId] = useState<string | null>(null);
  const [loadingPay, setLoadingPay] = useState(false);

  // Load all metro lines
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

  // Load stations by line
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
    } catch {
      message.error("Không thể tải danh sách ga.");
    } finally {
      setLoadingStations(false);
    }
  };

  // Next / Prev step
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

  // Fetch ticket price & route
  useEffect(() => {
    const fetchTicketPrice = async () => {
      if (current === 2 && fromStation && toStation) {
        setLoadingPrice(true);
        try {
          const response = await getTicketRoute(fromStation.id, toStation.id);
          setTicketPrice(response?.result?.price || null);
          setTicketRouteId(response?.result?.ticketRouteId || null);
        } catch {
          try {
            await createTicketRoute(fromStation.id, toStation.id);
            const retry = await getTicketRoute(fromStation.id, toStation.id);
            setTicketPrice(retry?.result?.price || null);
            setTicketRouteId(retry?.result?.ticketRouteId || null);
          } catch {
            message.error("Không thể lấy giá vé.");
          }
        } finally {
          setLoadingPrice(false);
        }
      }
    };
    fetchTicketPrice();
  }, [current, fromStation, toStation]);

  const handlePay = async () => {
    if (!ticketRouteId) {
      message.error("Không tìm thấy tuyến vé.");
      return;
    }
    setLoadingPay(true);
    try {
      const res = await createPaymentLink({ ticketRouteId });
      const checkoutUrl = res?.result?.paymentLink?.checkoutUrl;
      if (!checkoutUrl) {
        message.error("Không lấy được link thanh toán.");
        return;
      }
      window.location.href = checkoutUrl;
    } catch {
      message.error("Đã xảy ra lỗi khi tạo link thanh toán.");
    } finally {
    setLoadingPay(false);
  }
  };

  return (
    <div className="bg-[#f0f8ff] min-h-[100vh] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="rounded-2xl shadow-xl">
          <Steps current={current} className="!mb-8">
            <Step
              title={
                <div>
                  Chọn điểm đi
                  {fromStation && (
                    <div className="text-xs text-blue-600">{fromStation.name}</div>
                  )}
                </div>
              }
            />
            <Step
              title={
                <div>
                  Chọn điểm đến
                  {toStation && (
                    <div className="text-xs text-blue-600">{toStation.name}</div>
                  )}
                </div>
              }
            />
            <Step title="Thanh toán" />
          </Steps>

          {/* Step content */}
          {current === 0 && (
            <StepFrom
              lines={lines}
              fromLine={fromLine}
              fromStations={fromStations}
              fromStation={fromStation}
              loadingLines={loadingLines}
              loadingStations={loadingStations}
              onLineChange={(val) => loadStations(val, true)}
              onStationSelect={setFromStation}
            />
          )}

          {current === 1 && (
            <StepTo
              lines={lines}
              toLine={toLine}
              toStations={toStations}
              toStation={toStation}
              fromStation={fromStation}
              loadingLines={loadingLines}
              loadingStations={loadingStations}
              onLineChange={(val) => loadStations(val, false)}
              onStationSelect={setToStation}
            />
          )}

          {current === 2 && fromStation && toStation && (
            <StepPayment
              fromStation={fromStation}
              toStation={toStation}
              ticketPrice={ticketPrice}
              loadingPrice={loadingPrice}
            />
          )}

          {/* Buttons */}
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
                onClick={handlePay}
                loading={loadingPay}
                disabled={loadingPrice || !ticketRouteId}
              >
                Thanh toán
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BuyRouteTicket;
