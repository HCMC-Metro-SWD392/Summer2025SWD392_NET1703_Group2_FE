import React from "react";
import { Button } from "antd";
import { Ticket } from "lucide-react";
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
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {stations.map((station) => {
        const isSelected = selectedStation?.name === station.name;
        return (
          <Button
            key={station.name}
            onClick={() => {
              if (isSelected) {
                onSelect(null);
              } else {
                onSelect(station);
              }
            }}
            className={`flex items-center justify-start gap-3 !h-20 py-6 px-5 border rounded-xl hover:shadow-md ${isSelected ? "border-blue-500 bg-blue-50" : ""
              }`}
            type={isSelected ? "primary" : "default"}
          >
            <Ticket size={20} className="text-gray-600" />
            <div className="text-left">
              <div className="text-sm font-medium">{station.name}</div>
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export default StationSelector;
