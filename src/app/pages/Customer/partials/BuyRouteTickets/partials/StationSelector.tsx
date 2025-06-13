import React from "react";
import { Select } from "antd";
import type { Station } from "../../../../../../types/types";

type StationSelectorProps = {
  stations: Station[];
  selectedStation?: Station | null;
  onSelect: (station: Station | null) => void;
};

const StationSelector: React.FC<StationSelectorProps> = ({
  stations,
  selectedStation,
  onSelect,
}) => {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">Chọn ga</label>
      <Select
        allowClear
        placeholder="Chọn ga"
        value={selectedStation?.id}
        onChange={(value) => {
          const station = stations.find((s) => s.id === value) || null;
          onSelect(station);
        }}
        className="w-full"
        options={stations.map((station) => ({
          label: station.name,
          value: station.id,
        }))}
        disabled={stations.length == 0}
      />
    </div>
  );
};

export default StationSelector;
