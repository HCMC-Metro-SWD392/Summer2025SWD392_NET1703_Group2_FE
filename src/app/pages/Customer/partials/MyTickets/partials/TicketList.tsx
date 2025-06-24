import { Empty } from "antd";
import React from "react";
import type { Ticket } from "../../../../../../types/types";
import TicketCard from "./TicketCard";

interface Props {
  tickets: Ticket[];
  status: "unused" | "active" | "used";
}

const TicketList: React.FC<Props> = ({ tickets, status }) => {
  if (tickets.length === 0) return <Empty description="Không có vé" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {tickets.map((ticket) => (
        <TicketCard ticket={ticket} status={status}/>
      ))}
    </div>
  );
};

export default TicketList;
