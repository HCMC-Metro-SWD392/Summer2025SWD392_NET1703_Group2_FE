import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button, message, Space } from 'antd';
import { LeftOutlined, RightOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosInstance from '../../../../settings/axiosInstance';

interface StaffSchedule {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  workingDate: string;
  stationName: string;
  status: 'Normal' | 'EndShift' | 'Absent' | string;
}

const StaffWorkCalendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [data, setData] = useState<StaffSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentRange, setCurrentRange] = useState<{
    start: string;
    end: string;
  }>({
    start: dayjs().startOf('week').format('YYYY-MM-DDTHH:mm:ss'),
    end: dayjs().endOf('week').format('YYYY-MM-DDTHH:mm:ss'),
  });

  const fetchData = async (start: string, end: string) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/StaffSchedule/schedules-by-staff', {
        params: { fromDate: start, toDate: end },
      });
      if (res.data?.result) {
        setData(res.data.result);
      } else {
        setData([]);
        message.info('Không có lịch trong khoảng thời gian này');
      }
    } catch (err) {
      console.error(err);
      message.error('Không thể tải lịch làm việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentRange.start, currentRange.end);
  }, [currentRange]);

  const convertToEvents = () =>
    data.map((item) => {
      const start = dayjs(`${item.workingDate}T${item.startTime}`).toISOString();
      const end = dayjs(`${item.workingDate}T${item.endTime}`).toISOString();
      const color =
        item.status === 'Absent'
          ? '#f5222d'
          : item.status === 'EndShift'
          ? '#faad14'
          : '#52c41a';

      return {
        id: item.id,
        title: `${item.shiftName} - ${item.stationName}`,
        start,
        end,
        backgroundColor: color,
        borderColor: color,
      };
    });

  const handleDatesSet = (arg: any) => {
    const start = dayjs(arg.start).format('YYYY-MM-DDTHH:mm:ss');
    const end = dayjs(arg.end).subtract(1, 'second').format('YYYY-MM-DDTHH:mm:ss');
    setCurrentRange({ start, end });
  };

  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
  };

  const handleNext = () => {
    calendarRef.current?.getApi().next();
  };

  const handleToday = () => {
    calendarRef.current?.getApi().today();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Lịch Làm Việc Của Tôi</h2>
        <Space>
          <Button icon={<LeftOutlined />} onClick={handlePrev}>
            Tuần trước
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleToday}>
            Tuần này
          </Button>
          <Button icon={<RightOutlined />} onClick={handleNext}>
            Tuần sau
          </Button>
        </Space>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        allDaySlot={false}
        height="auto"
        slotMinTime="00:00:00"
        slotMaxTime="23:59:59"
        nowIndicator
        firstDay={1}
        locale="vi"
        events={convertToEvents()}
        datesSet={handleDatesSet}
        headerToolbar={false}
      />
    </div>
  );
};

export default StaffWorkCalendar;
