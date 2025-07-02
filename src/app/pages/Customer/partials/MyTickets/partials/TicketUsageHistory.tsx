import { useEffect, useState } from "react";
import { Typography, Spin, message, Tag } from "antd";
import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
// import { getTicketUsageHistory } from "../../../../../../api/ticketHistory/ticketHistory";
import axiosInstance from "../../../../../../settings/axiosInstance";

const { Text } = Typography;

interface UsageEntry {
  stationName: string;
  processedAt: string;
  status: 0 | 1;
}

const statusColors = {
  0: "blue",
  1: "green",
};

const statusLabels = {
  0: "Check-in",
  1: "Check-out",
};

const statusIcons = {
  0: <LoginOutlined />,
  1: <LogoutOutlined />,
};

const TicketUsageHistory = ({
  ticketId,
  reloadTrigger,
}: {
  ticketId: string;
  reloadTrigger: number;
}) => {
  const [history, setHistory] = useState<UsageEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await axiosInstance.get(`/api/TicketProcess/GetAllTicketProcessByTicketId/${ticketId}`)
        setHistory(data.data.result || []);
      } catch (err) {
        // message.error("Không thể tải lịch sử sử dụng vé.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [ticketId, reloadTrigger]); // GỌI API MỖI KHI reloadTrigger THAY ĐỔI

  return (
    <div className="bg-[#f9fafb] rounded-xl p-6 border border-dashed border-gray-300 min-h-[150px]">
      {loading ? (
        <div className="text-center text-gray-500">
          <Spin /> Đang tải dữ liệu...
        </div>
      ) : history.length === 0 ? (
        <div className="text-center text-gray-500 italic">Chưa có lịch sử sử dụng.</div>
      ) : (
        <ul className="text-sm space-y-4">
          {history.map((entry, index) => (
            <li key={index} className="border-b pb-2">
              <div className="flex justify-between">
                <Text strong>Ngày giờ:</Text>
                <span>{new Date(entry.processedAt).toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <Text strong>Trạm:</Text>
                <span>{entry.stationName}</span>
              </div>
              <div className="flex justify-between items-center">
                <Text strong>Loại:</Text>
                <Tag color={statusColors[entry.status]} icon={statusIcons[entry.status]}>
                  {statusLabels[entry.status]}
                </Tag>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TicketUsageHistory;
