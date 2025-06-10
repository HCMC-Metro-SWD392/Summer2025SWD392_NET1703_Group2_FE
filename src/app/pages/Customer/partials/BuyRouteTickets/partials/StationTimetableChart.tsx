import React, { useEffect, useRef, useState } from "react";
import { Divider, Spin } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import TrainList from "./TrainList";
import type { TimetableItem } from "./TrainList";
import { fetchTimetable } from "../../../../../../api/buyRouteTicket/buyRouteTicket";

interface Props {
  stationId: string;
}

const StationTimetableChart: React.FC<Props> = ({ stationId }) => {
  const [timetableData, setTimetableData] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdownUp, setCountdownUp] = useState<string | null>(null);
  const [countdownDown, setCountdownDown] = useState<string | null>(null);
  const [closestUpIndex, setClosestUpIndex] = useState<number>(-1);
  const [closestDownIndex, setClosestDownIndex] = useState<number>(-1);

  const listRefsUp = useRef<(HTMLDivElement | null)[]>([]);
  const listRefsDown = useRef<(HTMLDivElement | null)[]>([]);
  const listWrapperRefUp = useRef<HTMLDivElement>(null!);
  const listWrapperRefDown = useRef<HTMLDivElement>(null!);

  const parseTimeToDate = (time: string): Date => {
    const [h, m] = time.split(":").map(Number);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
  };

  const findClosestIndex = (data: TimetableItem[]): number => {
    const now = new Date();
    for (let i = 0; i < data.length; i++) {
      if (parseTimeToDate(data[i].startTime) > now) return i;
    }
    return -1;
  };

  const setupCountdown = (
    index: number,
    data: TimetableItem[],
    setCountdown: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (index === -1) return;

    const interval = setInterval(() => {
      const now = new Date();
      const targetTime = parseTimeToDate(data[index].startTime);
      const diff = targetTime.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown("Đã chạy");
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / 1000 / 60);
        const secs = Math.floor((diff / 1000) % 60);
        setCountdown(`Còn ${mins} phút ${secs} giây`);
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const scrollToItem = (
    index: number,
    itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
    wrapperRef: React.RefObject<HTMLDivElement>
  ) => {
    if (index !== -1 && itemRefs.current[index] && wrapperRef.current) {
      wrapperRef.current.scrollTop = itemRefs.current[index]!.offsetTop - 40;
    }
  };

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        setLoading(true);
        const data = await fetchTimetable(stationId);
        setTimetableData(data.result);
      } catch (error) {
        console.error("Failed to load timetable:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTimetable();
  }, [stationId]);

  const upTrains = timetableData.filter((item) => item.direction === 0);
  const downTrains = timetableData.filter((item) => item.direction === 1);

  useEffect(() => {
    if (timetableData.length === 0) return;

    const upIndex = findClosestIndex(upTrains);
    const downIndex = findClosestIndex(downTrains);

    setClosestUpIndex(upIndex);
    setClosestDownIndex(downIndex);

    scrollToItem(upIndex, listRefsUp, listWrapperRefUp);
    scrollToItem(downIndex, listRefsDown, listWrapperRefDown);

    const clearUp = setupCountdown(upIndex, upTrains, setCountdownUp);
    const clearDown = setupCountdown(downIndex, downTrains, setCountdownDown);

    return () => {
      clearUp && clearUp();
      clearDown && clearDown();
    };
  }, [timetableData]);

  return (
    <Spin spinning={loading} tip="Đang tải dữ liệu...">
      <div className="mt-4 bg-white border border-dashed border-gray-500 rounded-xl p-4 shadow-sm">
        <TrainList
          title="Chiều đi"
          color="blue"
          icon={<ArrowUpOutlined />}
          data={upTrains}
          closestIndex={closestUpIndex}
          countdown={countdownUp}
          listRefs={listRefsUp}
          wrapperRef={listWrapperRefUp}
        />

        <Divider className="my-4" />

        <TrainList
          title="Chiều về"
          color="green"
          icon={<ArrowDownOutlined />}
          data={downTrains}
          closestIndex={closestDownIndex}
          countdown={countdownDown}
          listRefs={listRefsDown}
          wrapperRef={listWrapperRefDown}
        />
      </div>
    </Spin>
  );
};

export default StationTimetableChart;
