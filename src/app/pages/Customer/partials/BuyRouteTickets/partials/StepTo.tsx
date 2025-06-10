import React from "react";
import { Select, Spin, Typography } from "antd";
import StationSelector from "./StationSelector";
import StationTimetableChart from "./StationTimetableChart";
import type { Line, Station } from "../../../../../../types/types";

const { Option } = Select;
const { Text } = Typography;

interface StepToProps {
  lines: Line[];
  toLine: string | null;
  toStation: Station | null;
  toStations: Station[];
  fromStation: Station | null;
  loadingLines: boolean;
  loadingStations: boolean;
  onLineChange: (lineId: string) => void;
  onStationSelect: (station: Station | null) => void;
}

const StepTo: React.FC<StepToProps> = ({
  lines,
  toLine,
  toStation,
  toStations,
  fromStation,
  loadingLines,
  loadingStations,
  onLineChange,
  onStationSelect,
}) => {
  // Lọc ga đến để không trùng với ga đi
  const filteredToStations = toStations.filter(
    (s) => s.name !== fromStation?.name
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* BÊN TRÁI: Chọn tuyến & ga */}
      <div className="space-y-6">
        <div>
          <Text strong>🚉 Chọn tuyến đến:</Text>
          <Select
            placeholder="Chọn tuyến"
            className="w-full mt-1"
            onChange={onLineChange}
            value={toLine || undefined}
            disabled={loadingLines}
          >
            {lines.map((line) => (
              <Option key={line.id} value={line.id}>
                {line.metroName}
              </Option>
            ))}
          </Select>
        </div>

        {toLine && (
          <div>
            <Text strong>🎯 Chọn ga đến:</Text>
            <Spin spinning={loadingStations}>
              <StationSelector
                stations={filteredToStations}
                selectedStation={toStation}
                onSelect={onStationSelect}
              />
            </Spin>
          </div>
        )}
      </div>

      {/* BÊN PHẢI: Biểu đồ giờ tàu */}
      <div>
        {toStation ? (
          <StationTimetableChart stationId={toStation.id} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
            Chọn một ga để xem giờ tàu
          </div>
        )}
      </div>
    </div>
  );
};

export default StepTo;
