import React, { useEffect, useState } from 'react';
import { Table, DatePicker, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import axiosInstance from '../../../../settings/axiosInstance';

const { RangePicker } = DatePicker;

interface StaffSchedule {
  id: string;
  staffId: string;
  staffFullName: string;
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  workingDate: string;
  stationId: string;
  stationName: string;
  status: 'Normal' | 'EndShift' | 'Absent' | string;
}

const StaffWorkSchedule: React.FC = () => {
  const [data, setData] = useState<StaffSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('week'),
    dayjs().endOf('week'),
  ]);

  const fetchData = async () => {
    if (!dateRange[0] || !dateRange[1]) {
      message.warning('Hãy chọn khoảng thời gian');
      return;
    }

    setLoading(true);
    try {
      const fromDate = dateRange[0].format('YYYY-MM-DDTHH:mm:ss');
      const toDate = dateRange[1].format('YYYY-MM-DDTHH:mm:ss');

      const response = await axiosInstance.get('/api/StaffSchedule/schedules-by-staff', {
        params: {
          fromDate,
          toDate,
        },
      });

      if (response.data?.result) {
        setData(response.data.result);
      } else {
        setData([]);
        message.info('Không có lịch trong khoảng thời gian này');
      }
    } catch (error) {
      console.error(error);
      message.error('Không thể tải lịch làm việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: ColumnsType<StaffSchedule> = [
    {
      title: 'Ngày làm',
      dataIndex: 'workingDate',
      key: 'workingDate',
    },
    {
      title: 'Ca làm',
      key: 'shift',
      render: (_, record) =>
        `${record.shiftName} (${record.startTime.slice(0, 5)} - ${record.endTime.slice(0, 5)})`,
    },
    {
      title: 'Ga',
      dataIndex: 'stationName',
      key: 'stationName',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        switch (status) {
          case 'Normal':
            return 'Bình thường';
          case 'EndShift':
            return 'Tan ca';
          case 'Absent':
            return 'Vắng';
          default:
            return status;
        }
      },
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lịch Làm Việc Của Tôi</h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <RangePicker
          value={dateRange}
          onChange={(range) => setDateRange(range as [Dayjs, Dayjs])}
        />
        <Button type="primary" onClick={fetchData}>
          Tìm lịch làm việc
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        bordered
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default StaffWorkSchedule;
