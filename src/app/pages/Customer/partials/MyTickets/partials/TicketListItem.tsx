import { useState } from "react";
import { Typography, Tag, Modal, Tabs } from "antd";
import type { Ticket } from "../../../../../../types/types";
import { getStatusColor, getStatusLabel } from "./ticketUtils";
import logoMetroHCMC from "../../../../../assets/logo.png";
import TicketUsageHistory from "./TicketUsageHistory";
import { ClockCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { TabPane } = Tabs;

const TicketListItem = ({ ticket, status }: { ticket: Ticket; status: "unused" | "active" | "used" }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("2"); // Tab thông tin mặc định

  const isSubscription = Boolean(ticket.subscriptionTicketId);

  const handleClick = () => {
    setIsModalVisible(true);
    setActiveTab("2");
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <>
      <div
        className="flex items-start justify-between p-4 border-b hover:bg-gray-50 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex flex-col gap-1 text-sm">
          <div className="font-semibold text-cyan-800">HCMC METRO - {isSubscription ? "Vé tháng" : "Vé lượt"}</div>
          <div>
            <Text strong>Tuyến:</Text>{" "}
            {isSubscription ? `${ticket.fromStationSub} → ${ticket.toStationSub}` : `${ticket.fromStationRoute} → ${ticket.toStationRoute}`}
          </div>
          <div>
            <Text strong>HSD:</Text> {new Date(ticket.endDate).toLocaleDateString("vi-VN")}
          </div>
        </div>
        <div>
          <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
        </div>
      </div>

      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
        title="Chi tiết vé"
        width={420}
      >
        <Tabs activeKey={activeTab} onChange={handleTabChange} centered>
          <TabPane tab="Thông tin vé" key="2">
            <div className="bg-[#f9fafb] rounded-xl p-6 border border-dashed border-gray-300">
              <div className="flex justify-center mb-4">
                <img src={logoMetroHCMC} alt="Metro Logo" className="h-6" />
              </div>
              <div className="text-sm grid gap-2">
                {isSubscription ? (
                  <>
                    <div className="flex justify-between">
                      <Text strong className="text-gray-600">Tuyến chính:</Text>
                      <span>{ticket.fromStationSub} → {ticket.toStationSub}</span>
                    </div>
                    {ticket.ticketRouteId && (
                      <div className="flex justify-between">
                        <Text strong className="text-gray-600">Tuyến tích hợp:</Text>
                        <span>{ticket.fromStationRoute} → {ticket.toStationRoute}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between">
                    <Text strong className="text-gray-600">Tuyến chính:</Text>
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
            tab={<span><ClockCircleOutlined /> Lịch sử sử dụng</span>}
            key="3"
          >
            <TicketUsageHistory ticketId={ticket.id} reloadTrigger={0} />
          </TabPane>
        </Tabs>
      </Modal>
    </>
  );
};

export default TicketListItem;
