import { Empty, Pagination } from "antd";
import React from "react";
import type { Ticket } from "../../../../../../types/types";
import TicketCard from "./TicketCard";
import TicketListItem from "./TicketListItem";

interface Props {
  tickets: Ticket[];
  status: "unused" | "active" | "used";
  total: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const TicketList: React.FC<Props> = ({ tickets, status, total, pageSize, currentPage, onPageChange }) => {
  if (tickets.length === 0) return <Empty description="Không có vé" />;

   const isListView = status === "used";

  if (tickets.length === 0) return <Empty description="Không có vé" />;

  return (
    <div className="w-full space-y-4">
      <div
        className={
          isListView
            ? "w-full flex flex-col divide-y rounded-md bg-white"
            : "grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
        }
      >
        {tickets.map((ticket) =>
          isListView ? (
            <TicketListItem key={ticket.id} ticket={ticket} status={status} />
          ) : (
            <TicketCard key={ticket.id} ticket={ticket} status={status} />
          )
        )}
      </div>

      <div className="flex justify-center mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={onPageChange}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default TicketList;
