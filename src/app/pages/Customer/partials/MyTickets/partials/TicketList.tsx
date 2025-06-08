import React from "react";
import { Card, Typography, Empty, Tag } from "antd";
import { getStatusColor, getStatusLabel } from "./ticketUtils";
import type { Ticket } from "../../../../../../types/types";

const { Title, Text } = Typography;

interface Props {
  tickets: Ticket[];
}

const TicketList: React.FC<Props> = ({ tickets }) => {
  if (tickets.length === 0) return <Empty description="Không có vé" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="shadow-md rounded-xl border">
          <div className="flex justify-between items-center mb-2">
            <Title level={5}>Vé lượt</Title>
            <Tag color={getStatusColor(ticket.status)}>{getStatusLabel(ticket.status)}</Tag>
          </div>
          <Text>
            <span className="font-semibold">Tuyến:</span> {ticket.fromStation} → {ticket.toStation}
          </Text>
          <div className="mt-2">
            <Text>
              <span className="font-semibold">Ngày mua:</span>{" "}
              {new Date(ticket.createdAt).toLocaleDateString()}
            </Text>
          </div>
          <div>
            <Text>
              <span className="font-semibold">Giá:</span> {ticket.price.toLocaleString()}₫
            </Text>
          </div>
          <div>
            <Text>
              <span className="font-semibold">HSD:</span> {ticket.expirationDate}
            </Text>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TicketList;
