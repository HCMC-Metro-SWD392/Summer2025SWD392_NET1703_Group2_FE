import React from "react";
import { List, Tag } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";

export interface TimetableItem {
  startTime: string;
  direction: 0 | 1;
  line: string;
}

interface TrainListProps {
  title: string;
  color: string;
  icon: React.ReactNode;
  data: TimetableItem[];
  closestIndex: number;
  countdown: string | null;
  listRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  wrapperRef: React.RefObject<HTMLDivElement>;
}

const parseTimeToDate = (time: string): Date => {
  const [h, m, s = 0] = time.split(":").map(Number); 
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, s, 0);
};


const formatTime = (time: string) => time.slice(0, 5);

const TrainList: React.FC<TrainListProps> = ({
  title,
  color,
  icon,
  data,
  closestIndex,
  countdown,
  listRefs,
  wrapperRef,
}) => {
  return (
    <>
      <h5 className={`text-${color}-700 font-semibold mb-2 flex items-center gap-2`}>
        {icon} {title}
      </h5>
      <div ref={wrapperRef} style={{ maxHeight: 102, overflowY: "auto" }}>
        <List
          size="small"
          dataSource={data}
          renderItem={(item, index) => {
            const trainTime = parseTimeToDate(item.startTime);
            const now = new Date();
            let label: string;
            let tagColor: string;

            if (trainTime < now) {
              label = "Đã chạy";
              tagColor = "gray";
            } else if (index === closestIndex) {
              label = countdown ?? "Đang đến...";
              tagColor = "green";
            } else {
              label = "Chưa xuất phát";
              tagColor = "blue";
            }

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
                  </span>
                  <Tag color={tagColor}>{label}</Tag>
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
