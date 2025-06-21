import { Alert, Button, message, Result, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import endpoints from "../../../../../api/endpoints";
import axiosInstance from "../../../../../settings/axiosInstance";

type Status = "loading" | "success" | "error" | "invalid" | "cancelled";

const VerifyTicketPayment = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const cancel = searchParams.get("cancel");
  const orderCode = searchParams.get("orderCode") ?? "";
  const statusParam = searchParams.get("status");
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>("loading");
  const [ticketCreated, setTicketCreated] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const hasCalledCreateTicket = useRef(false); // ✅ Tránh gọi API nhiều lần

  // Xác định trạng thái thanh toán
  useEffect(() => {
    if (!orderCode) {
      setStatus("invalid");
      return;
    }

    if (cancel === "true" || statusParam === "CANCELLED") {
      setStatus("cancelled");
      return;
    }

    if (code === "00" && statusParam === "PAID") {
      setStatus("success");
      return;
    }

    if (code === "01" || code === "02") {
      setStatus("error");
      return;
    }

    setStatus("error");
  }, [code, cancel, orderCode, statusParam]);

  // Gọi API tạo vé nếu thanh toán thành công (chỉ 1 lần)
  useEffect(() => {
    const createTicket = async () => {
      try {
        const res = await axiosInstance.put(endpoints.createTicket(orderCode));
        if (res.status === 201) {
          setTicketCreated(true);
          // message.success("Vé đã được tạo thành công!");
        } else {
          // message.error("Không thể tạo vé. Vui lòng liên hệ hỗ trợ.");
          await tryFallback();
        }
      } catch (error) {
        console.error("Ticket creation failed:", error);
        message.error("Đã xảy ra lỗi khi tạo vé.");
        await tryFallback();
      } finally {
        setCreatingTicket(false);
      }
    };

    const tryFallback = async () => {
      try {
        const fallbackRes = await axiosInstance.put(endpoints.createTicketOverStation(orderCode));
        if (fallbackRes.status === 201) {
          setTicketCreated(true);
          // message.success("Vé đã được tạo thành công (qua API dự phòng)!");
        } else {
          message.error("Không thể tạo vé (dù đã thử lại). Vui lòng liên hệ hỗ trợ.");
        }
      } catch (fallbackError) {
        // console.error("Gọi API dự phòng cũng thất bại:", fallbackError);
        message.error("Đã xảy ra lỗi khi tạo vé. Vui lòng thử lại sau.");
      }
    };

    if (
      status === "success" &&
      orderCode &&
      !ticketCreated &&
      !hasCalledCreateTicket.current
    ) {
      hasCalledCreateTicket.current = true;
      setCreatingTicket(true);
      createTicket();
    }
  }, [status, orderCode, ticketCreated]);

  return (
    <div className="p-4 flex justify-center items-center min-h-[calc(100vh-80px)] bg-[#E9F5FB]">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <p className="text-gray-600 text-xl">Đang kiểm tra thanh toán...</p>
        </div>
      )}

      {status === "success" && creatingTicket && (
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <p className="text-gray-600 text-xl">Đang tạo vé...</p>
        </div>
      )}

      {status === "success" && !creatingTicket && (
        <Result
          status="success"
          title="Thanh toán thành công"
          subTitle={
            <p className="text-xl text-gray-700">
              Vé của bạn đã được thanh toán thành công. Chúc bạn có chuyến đi vui vẻ!
            </p>
          }
          extra={
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/tickets/my-tickets")}
            >
              Vé của tôi
            </Button>
          }
        />
      )}

      {status === "error" && (
        <Result
          status="error"
          title="Thanh toán thất bại"
          subTitle={
            <p className="text-xl text-gray-700">
              Không thể xác minh thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.
            </p>
          }
        />
      )}

      {status === "invalid" && (
        <Alert
          message="Đường dẫn không hợp lệ"
          description="Thiếu mã thanh toán (orderCode)."
          type="warning"
          showIcon
        />
      )}

      {status === "cancelled" && (
        <Result
          status="warning"
          title="Thanh toán đã bị hủy"
          subTitle={
            <p className="text-xl text-gray-700">
              Thanh toán của bạn đã bị hủy. Nếu cần hỗ trợ, vui lòng liên hệ bộ phận chăm sóc khách hàng.
            </p>
          }
        />
      )}
    </div>
  );
};

export default VerifyTicketPayment;
