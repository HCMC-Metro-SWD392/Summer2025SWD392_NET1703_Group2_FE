import React from "react";
import { Typography, Spin } from "antd";
import logoMetro from "../../../../../assets/logo.png";
import type { Station } from "../../../../../../types/types";

const { Text } = Typography;

interface Props {
  fromStation: Station;
  toStation: Station;
  ticketPrice: number | null;
  loadingPrice: boolean;
}

const StepPayment: React.FC<Props> = ({
  fromStation,
  toStation,
  ticketPrice,
  loadingPrice,
}) => (
  <div className="bg-[#f9fafb] rounded-xl p-6 border border-dashed border-gray-300">
    <div className="flex justify-center mb-4">
      <img src={logoMetro} alt="Metro Logo" className="h-6" />
    </div>
    <div className="text-sm text-gray-700 space-y-2">
      <p><b className="text-blue-700">Loại vé:</b> Vé lượt</p>
      <p><b className="text-blue-700">Thời hạn:</b> 30 ngày kể từ ngày mua</p>
      <p><b className="text-red-600">Lưu ý:</b> Vé chỉ sử dụng một lần</p>
      <p><b className="text-blue-700">Tuyến:</b> {fromStation.name} → {toStation.name}</p>
    </div>
    <div className="mt-6 text-center">
      {loadingPrice ? (
        <Spin />
      ) : ticketPrice !== null ? (
        <Text strong className="text-xl text-green-600">
          Giá vé: {ticketPrice.toLocaleString()}₫
        </Text>
      ) : (
        <Text type="danger">Không thể lấy giá vé</Text>
      )}
    </div>
  </div>
);

export default StepPayment;
