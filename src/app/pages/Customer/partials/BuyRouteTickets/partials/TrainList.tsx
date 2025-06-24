import React, { useEffect, useState } from "react";
import { List, Tag } from "antd";
import {
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import type { LineStartAndEndStation } from "../../../../../../types/types";

export interface TimetableItem {
  startTime: string;
  direction: 0 | 1;
  line: string;
}

interface TrainListProps {
  data: TimetableItem[];
  closestIndex: number;
  listRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  wrapperRef: React.RefObject<HTMLDivElement>;
  startAndEndStationOfLine: LineStartAndEndStation | null;
}

const parseTimeToDate = (time: string): Date => {
  const [h, m, s = 0] = time.split(":").map(Number);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, s, 0);
};

const formatTime = (time: string) => time.slice(0, 5);

const getTimeDiffText = (target: Date): string => {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "";

  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;

  if (hours > 0) {
    return `Còn ${hours} giờ ${remainMins} phút`;
  } else {
    return `Còn ${remainMins} phút`;
  }
};

const TrainList: React.FC<TrainListProps> = ({
  data,
  closestIndex,
  listRefs,
  wrapperRef,
  startAndEndStationOfLine,
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000); // cập nhật mỗi giây

    return () => clearInterval(interval);
  }, []);

  const upcomingTrains = data.filter((item) => parseTimeToDate(item.startTime) > now);

  return (
    <>
      {/* <h5 className="font-semibold mb-2 flex items-center gap-2 text-gray-700">
        <ClockCircleOutlined /> Giờ tàu
      </h5> */}
      <div ref={wrapperRef} className="max-h-30 min-h-30" style={{ overflowY: "auto" }}>
        <List
          size="small"
          dataSource={upcomingTrains}
          renderItem={(item, index) => {
            const trainTime = parseTimeToDate(item.startTime);
            const isClosest =
              data.findIndex((d) => d.startTime === item.startTime) === closestIndex;
            const label = getTimeDiffText(trainTime);
            const tagColor = isClosest ? "green" : "blue";
            const directionIcon =
              item.direction === 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
            const directionStation =
              item.direction === 0
                ? startAndEndStationOfLine?.endStationName
                : startAndEndStationOfLine?.startStationName;

            return (
              <List.Item>
                <div
                  ref={(el) => {
                    listRefs.current[index] = el;
                  }}
                  className="flex justify-between w-full text-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <ClockCircleOutlined /> {formatTime(item.startTime)}
                    <Tag color="default">
                      {directionIcon} {directionStation}
                    </Tag>
                  </span>
                  <div className="flex gap-2 items-center">
                    <Tag color={tagColor}>{label}</Tag>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
};

export default TrainList;
