import React, { useEffect, useState } from 'react';
import {
  Card,
  DatePicker,
  Select,
  Table,
  Button,
  message,
  Typography,
  Space,
  Spin,
} from 'antd';
import dayjs from 'dayjs';
import axiosInstance from '../../../../settings/axiosInstance';

const { Title } = Typography;
const { Option } = Select;

interface Staff {
  id: string;
  user: {
    fullName: string;
    email: string;
  };
}

interface StaffShift {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
}

interface ScheduleItem {
  id: string;
  shiftId: string;
  workingDate: string;
}

const AssignShiftByDate: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [shiftList, setShiftList] = useState<StaffShift[]>([]);
  const [unscheduledStaff, setUnscheduledStaff] = useState<Staff[]>([]);
  const [matchingScheduleId, setMatchingScheduleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load danh sách ca làm
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const { data } = await axiosInstance.get('/api/shifts');
        setShiftList(data);
      } catch {
        message.error('Không thể tải danh sách ca làm');
      }
    };
    fetchShifts();
  }, []);

  // Khi ngày hoặc ca được chọn, tìm scheduleId tương ứng và nhân viên chưa có ca
  useEffect(() => {
    const fetchUnscheduledAndScheduleId = async () => {
      if (!selectedDate || !selectedShift) return;
      setLoading(true);
      try {
        // Lấy scheduleId theo workingDate + shiftId
        const scheduleRes = await axiosInstance.get('/api/staff-schedules', {
          params: { date: selectedDate },
        });
        const scheduleList: ScheduleItem[] = scheduleRes.data;

        const matched = scheduleList.find(
          (s) => s.shiftId === selectedShift && s.workingDate === selectedDate
        );

        if (!matched) {
          setMatchingScheduleId(null);
          message.warning('Không tìm thấy lịch phù hợp cho ngày và ca này.');
          setUnscheduledStaff([]);
          return;
        }

        setMatchingScheduleId(matched.id);

        // Gọi API lấy nhân viên chưa có ca
        const { data: staffData } = await axiosInstance.get(
          '/api/StaffSchedule/get-unscheduled-staff',
          {
            params: {
              workingDate: selectedDate,
              shiftId: selectedShift,
            },
          }
        );
        setUnscheduledStaff(staffData);
      } catch {
        message.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchUnscheduledAndScheduleId();
  }, [selectedDate, selectedShift]);

  const handleAssign = async (staffId: string) => {
    if (!matchingScheduleId) {
      message.error('Không có scheduleId để gán');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.put('/api/StaffSchedule/assign-staff', {
        params: {
          staffId,
          scheduleId: matchingScheduleId,
        },
      });

      message.success('Gán ca thành công');
      setUnscheduledStaff((prev) => prev.filter((s) => s.id !== staffId));
    } catch {
      message.error('Gán ca thất bại');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tên nhân viên',
      dataIndex: 'user',
      key: 'user',
      render: (user: Staff['user']) => `${user.fullName} (${user.email})`,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Staff) => (
        <Button type="primary" onClick={() => handleAssign(record.id)} loading={loading}>
          Gán vào ca
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: 24 }}>
      <Title level={3}>Gán Nhân Viên Vào Ca Làm</Title>
      <Card>
        <Space>
          <DatePicker
            onChange={(date) =>
              setSelectedDate(date ? date.format('YYYY-MM-DD') : null)
            }
            placeholder="Chọn ngày làm việc"
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
          <Select
            placeholder="Chọn ca làm"
            onChange={(value) => setSelectedShift(value)}
            style={{ width: 250 }}
            allowClear
          >
            {shiftList.map((shift) => (
              <Option key={shift.id} value={shift.id}>
                {shift.shiftName} ({shift.startTime} - {shift.endTime})
              </Option>
            ))}
          </Select>
        </Space>
      </Card>

      {selectedDate && selectedShift && (
        <Card title="Nhân viên chưa được phân ca">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={unscheduledStaff}
              rowKey="id"
              pagination={false}
            />
          </Spin>
        </Card>
      )}
    </Space>
  );
};

export default AssignShiftByDate;
