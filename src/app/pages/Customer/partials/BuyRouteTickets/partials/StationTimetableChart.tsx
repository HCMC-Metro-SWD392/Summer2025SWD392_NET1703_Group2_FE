import React, { useEffect, useRef, useState } from "react";
import { Spin, Empty, Typography } from "antd";
import { fetchTimetable } from "../../../../../../api/buyRouteTicket/buyRouteTicket";
import type { TimetableItem } from "./TrainList";
import TrainList from "./TrainList";
import type { LineStartAndEndStation, Station } from "../../../../../../types/types";

const { Text } = Typography;

interface Props {
  station: Station | null;
  startAndEndStationOfLine: LineStartAndEndStation | null;
  tourRef?: React.RefObject<HTMLDivElement | null>; // Ref để dùng với Tour
}

const StationTimetableChart: React.FC<Props> = ({
  station,
  startAndEndStationOfLine,
  tourRef,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TimetableItem[]>([]);
  const [closestIndex, setClosestIndex] = useState<number>(-1);

  const listRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null!);

  const parseTimeToDate = (time: string): Date => {
    const [h, m] = time.split(":").map(Number);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  };

  const findClosestIndex = (list: TimetableItem[]): number => {
    const now = new Date();
    return list.findIndex((item) => parseTimeToDate(item.startTime) > now);
  };

  const scrollToItem = (index: number) => {
    if (index !== -1 && listRefs.current[index] && wrapperRef.current) {
      wrapperRef.current.scrollTop = listRefs.current[index]!.offsetTop - 40;
    }
  };

  useEffect(() => {
    if (!station?.id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetchTimetable(station.id);
        const sorted = res.result.sort(
          (a: TimetableItem, b: TimetableItem) =>
            parseTimeToDate(a.startTime).getTime() -
            parseTimeToDate(b.startTime).getTime()
        );
        setData(sorted);
      } catch (err) {
        console.error("Failed to fetch timetable:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [station?.id]);

  useEffect(() => {
    const index = findClosestIndex(data);
    setClosestIndex(index);
    scrollToItem(index);
  }, [data]);

  if (station === null) {
    return (
      <div className="mt-3" ref={tourRef}>
        <Text strong>🕒 Giờ tàu chạy:</Text>
        <div className="mt-2 bg-white border border-dashed border-gray-500 rounded-xl p-4 text-center text-gray-500">
          <div className="min-h-48 flex items-center justify-center">
            <Empty description="Chọn ga để xem giờ chạy" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3" ref={tourRef}>
      <Text strong>🕒 Giờ tàu chạy: Tại {station.name}</Text>
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <div className="mt-2 bg-white border border-dashed border-gray-500 rounded-xl p-4 shadow-sm">
          <TrainList
            data={data}
            closestIndex={closestIndex}
            listRefs={listRefs}
            wrapperRef={wrapperRef}
            startAndEndStationOfLine={startAndEndStationOfLine}
          />
        </div>
      </Spin>
    </div>
  );
};

export default StationTimetableChart;
