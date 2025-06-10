import React from "react";
import { Select, Spin, Typography } from "antd";
import StationSelector from "./StationSelector";
import StationTimetableChart from "./StationTimetableChart";
import type { Line, Station } from "../../../../../../types/types";

const { Option } = Select;
const { Text } = Typography;

interface StepFromProps {
  lines: Line[];
  fromLine: string | null;
  fromStation: Station | null;
  fromStations: Station[];
  loadingLines: boolean;
  loadingStations: boolean;
  onLineChange: (lineId: string) => void;
  onStationSelect: (station: Station | null) => void;
}

const StepFrom: React.FC<StepFromProps> = ({
  lines,
  fromLine,
  fromStation,
  fromStations,
  loadingLines,
  loadingStations,
  onLineChange,
  onStationSelect,
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* BÊN TRÁI: Chọn tuyến & ga */}
      <div className="space-y-6">
        <div>
          <Text strong>🚆 Chọn tuyến đi:</Text>
          <Select
            placeholder="Chọn tuyến"
            className="w-full mt-1"
            onChange={onLineChange}
            value={fromLine || undefined}
            disabled={loadingLines}
          >
            {lines.map((line) => (
              <Option key={line.id} value={line.id}>
                {line.metroName}
              </Option>
            ))}
          </Select>
        </div>

        {fromLine && (
          <div>
            <Text strong>📍 Chọn ga đi:</Text>
            <Spin spinning={loadingStations}>
              <StationSelector
                stations={fromStations}
                selectedStation={fromStation}
                onSelect={onStationSelect}
              />
            </Spin>
          </div>
        )}
      </div>

      {/* BÊN PHẢI: Biểu đồ giờ tàu */}
      <div>
        {fromStation ? (
          <StationTimetableChart stationId={fromStation.id} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
            Chọn một ga để xem giờ tàu
          </div>
        )}
      </div>
    </div>
  );
};

export default StepFrom;
