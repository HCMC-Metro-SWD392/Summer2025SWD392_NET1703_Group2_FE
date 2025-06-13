import React from "react";
import { Typography, Spin } from "antd";
import logoMetro from "../../../../../assets/logo.png";
import type { Station } from "../../../../../../types/types";

const { Text } = Typography;

interface Props {
  fromStation: Station | null;
  toStation: Station | null;
  ticketPrice: number | null;
  loadingPrice: boolean;
  ticketDisplayName: string;
}

const StepPayment: React.FC<Props> = ({
  fromStation,
  toStation,
  ticketPrice,
  loadingPrice,
  ticketDisplayName,
}) => (
  <div className="bg-[#f9fafb] rounded-xl p-6 border border-dashed border-gray-300">
    <div className="flex justify-center mb-4">
      <img src={logoMetro} alt="Metro Logo" className="h-6" />
    </div>
    <div className="text-sm text-gray-700 space-y-2">
      <p><b className="text-blue-700">Loại vé:</b> {ticketDisplayName}</p>
      <p><b className="text-blue-700">Thời hạn:</b> 30 ngày kể từ ngày mua</p>
      <p><b className="text-red-600">Lưu ý:</b> Vé chỉ sử dụng một lần</p>
      <p>
        <b className="text-blue-700">Tuyến:</b>{" "}
        {fromStation ? fromStation.name : <span className="text-gray-400">Chưa chọn</span>} →{" "}
        {toStation ? toStation.name : <span className="text-gray-400">Chưa chọn</span>}
      </p>
    </div>
    <div className="mt-6 text-center">
      {loadingPrice ? (
        <Spin />
      ) : ticketPrice !== null ? (
        <Text strong className="text-xl text-green-600">
          Giá vé: {ticketPrice.toLocaleString()}₫
        </Text>
      ) : (
        <Text type="secondary">Vui lòng chọn đủ 2 ga để xem giá vé</Text>
      )}
    </div>
  </div>
);

export default StepPayment;
