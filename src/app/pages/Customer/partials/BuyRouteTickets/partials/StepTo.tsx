import React from "react";
import { Select, Spin, Typography } from "antd";
import StationSelector from "./StationSelector";
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
  const filteredToStations = toStations.filter(
    (s) => s.name !== fromStation?.name
  );

  return (
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
    </div>
  );
};

export default StepTo;
