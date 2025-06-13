import { useState } from "react";
import { Typography, Tag, Card, message, Modal, QRCode, Tabs } from "antd";
import type { Ticket } from "../../../../../../types/types";
import { getStatusColor, getStatusLabel } from "./ticketUtils";
import logoMetro from "../../../../../assets/fpt.png"

const { Text } = Typography;
const { TabPane } = Tabs;

const TicketCard = ({ ticket, status }: { ticket: Ticket, status: "unused" | "active" | "used" }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleUseTicket = () => {
    if (status == "used") {
      message.warning("Vé không còn hợp lệ để sử dụng.");
      return;
    }

    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Card
        key={ticket.id}
        onClick={handleUseTicket}
        hoverable
        className="shadow-md rounded-xl border p-0 overflow-hidden max-w-2xl font-sans transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-blue-500"
      >
        <div className="grid grid-cols-[1fr_80px] gap-4 px-0 py-0">
          {/* Left side - Ticket Info */}
          <div className="px-4 py-3">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-cyan-800 font-bold text-base">HCMC METRO</div>
                <div className="text-xs text-gray-600 font-semibold">Vé lượt</div>
              </div>
              <Tag color={getStatusColor(status)}>
                {getStatusLabel(status)}
              </Tag>
            </div>

            {/* Route Info */}
            <div className="text-sm mb-1">
              <Text className="font-semibold">Tuyến:</Text> {ticket.fromStation} → {ticket.toStation}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-x-4 text-xs mt-3">
              <div>
                <Text className="font-semibold">Ngày mua:</Text><br />
                {new Date(ticket.startDate).toLocaleDateString("vi-VN")}
              </div>
              <div>
                <Text className="font-semibold">HSD:</Text><br />
                {new Date(ticket.endDate).toLocaleDateString("vi-VN")}
              </div>
              <div className="col-span-2 mt-2">
                <Text className="font-semibold">Giá:</Text> {ticket.price.toLocaleString()}₫
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-4 text-[10px] italic text-gray-500">
              Bấm vào vé để sử dụng trước ngày hết hạn.
            </div>
          </div>

          {/* Right side - Status strip */}
          <div className="bg-gray-100 border-l border-dashed flex flex-col items-center justify-center px-2 py-4">
            <div className="text-[10px] text-gray-500 mt-2 rotate-[-90deg] whitespace-nowrap tracking-widest">
              Serial : {ticket.ticketSerial}
            </div>
          </div>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        centered
        title="Sử dụng vé"
      >
        <Tabs defaultActiveKey="1" centered>
          <TabPane tab="QR Code" key="1">
            <div className="flex justify-center py-4">
              <QRCode
                value={ticket.id}
                size={180}
                icon={logoMetro}
                iconSize={40}
                bordered
              />
            </div>
          </TabPane>
          <TabPane tab="Thông tin vé" key="2">
            <div className="text-sm text-left px-2 py-2">
              <p><Text strong>Tuyến:</Text> {ticket.fromStation} → {ticket.toStation}</p>
              <p><Text strong>Ngày mua:</Text> {new Date(ticket.startDate).toLocaleDateString("vi-VN")}</p>
              <p><Text strong>HSD:</Text> {new Date(ticket.endDate).toLocaleDateString("vi-VN")}</p>
              <p><Text strong>Giá:</Text> {ticket.price.toLocaleString()}₫</p>
              {ticket.id && <p><Text strong>Mã vé:</Text> {ticket.id}</p>}
              <p><Text strong>Trạng thái:</Text> {getStatusLabel(status)}</p>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
    </>
  );
};

export default TicketCard;
