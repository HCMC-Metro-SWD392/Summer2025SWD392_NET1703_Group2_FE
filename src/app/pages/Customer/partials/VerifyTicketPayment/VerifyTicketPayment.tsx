import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Spin, Result, Alert } from "antd";

type Status = "loading" | "success" | "error" | "invalid" | "cancelled";

const VerifyTicketPayment = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const id = searchParams.get("id"); // paymentLinkId, bạn có thể dùng nếu cần
  const cancel = searchParams.get("cancel");
  const orderCode = searchParams.get("orderCode");
  const statusParam = searchParams.get("status");

  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!orderCode) {
      setStatus("invalid");
      return;
    }

    // Xử lý trạng thái theo các tham số query
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

    // Trường hợp khác chưa rõ, mình cho trạng thái lỗi
    setStatus("error");
  }, [code, cancel, orderCode, statusParam]);

  return (
    <div className="p-4 flex justify-center items-center min-h-[calc(100vh-80px)] bg-[#E9F5FB]">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <p className="text-gray-600 text-xl">Đang kiểm tra thanh toán...</p>
        </div>
      )}

      {status === "success" && (
        <Result
          status="success"
          title="Thanh toán thành công"
          subTitle={
            <p className="text-xl text-gray-700">
              Vé của bạn đã được thanh toán thành công. Chúc bạn có chuyến đi vui vẻ!
            </p>
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
