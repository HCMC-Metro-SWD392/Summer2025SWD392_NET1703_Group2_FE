import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  message,
  Space,
  Typography,
  Table,
  Tag,
  Modal,
  Spin,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

interface Staff {
  id: string;
  userId: string;
  user: {
    id: string;
    fullName: string | null;
    email: string;
  };
}

interface StaffShift {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
}

interface StaffSchedule {
  id: string;
  staffId: string;
  shiftId: string;
  workingDate: string;
  status: string;
  staff: Staff;
  shift: StaffShift;
}

const AssignStaffShift: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [shiftList, setShiftList] = useState<StaffShift[]>([]);
  const [existingSchedules, setExistingSchedules] = useState<StaffSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch staff and shift data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch staff list
        const staffResponse = await fetch('/api/staff');
        const staffData = await staffResponse.json();
        setStaffList(staffData);

        // Fetch shift list
        const shiftResponse = await fetch('/api/shifts');
        const shiftData = await shiftResponse.json();
        setShiftList(shiftData);
      } catch (error) {
        message.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch existing schedules when date changes
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedDate) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/staff-schedules?date=${selectedDate}`);
        const data = await response.json();
        setExistingSchedules(data);
      } catch (error) {
        message.error('Failed to fetch schedules');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [selectedDate]);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date ? date.format('YYYY-MM-DD') : null);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId: values.staffId,
          shiftId: values.shiftId,
          workingDate: values.workingDate.format('YYYY-MM-DD'),
          status: 'pending',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign shift');
      }

      message.success('Shift assigned successfully');
      form.resetFields();
      // Refresh schedules
      if (selectedDate) {
        const updatedSchedules = await fetch(`/api/staff-schedules?date=${selectedDate}`);
        const data = await updatedSchedules.json();
        setExistingSchedules(data);
      }
    } catch (error) {
      message.error('Failed to assign shift');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this schedule?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/staff-schedules/${scheduleId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete schedule');
          }

          message.success('Schedule deleted successfully');
          // Refresh schedules
          if (selectedDate) {
            const updatedSchedules = await fetch(`/api/staff-schedules?date=${selectedDate}`);
            const data = await updatedSchedules.json();
            setExistingSchedules(data);
          }
        } catch (error) {
          message.error('Failed to delete schedule');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns: ColumnsType<StaffSchedule> = [
    {
      title: 'Staff Name',
      dataIndex: ['staff', 'user', 'fullName'],
      key: 'staffName',
    },
    {
      title: 'Shift',
      dataIndex: ['shift', 'shiftName'],
      key: 'shiftName',
    },
    {
      title: 'Time',
      key: 'time',
      render: (_, record) => `${record.shift.startTime} - ${record.shift.endTime}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : status === 'pending' ? 'warning' : 'error'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" danger onClick={() => handleDelete(record.id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Title level={2}>Assign Staff Shift</Title>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={loading}
        >
          <Form.Item
            name="staffId"
            label="Staff"
            rules={[{ required: true, message: 'Please select a staff member' }]}
          >
            <Select placeholder="Select staff member">
              {staffList.map((staff) => (
                <Option key={staff.id} value={staff.id}>
                  {staff.user.fullName} ({staff.user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="shiftId"
            label="Shift"
            rules={[{ required: true, message: 'Please select a shift' }]}
          >
            <Select placeholder="Select shift">
              {shiftList.map((shift) => (
                <Option key={shift.id} value={shift.id}>
                  {shift.shiftName} ({shift.startTime} - {shift.endTime})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="workingDate"
            label="Working Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              onChange={handleDateChange}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Assign Shift
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {selectedDate && (
        <Card title={`Schedules for ${dayjs(selectedDate).format('DD/MM/YYYY')}`}>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={existingSchedules}
              rowKey="id"
              pagination={false}
            />
          </Spin>
        </Card>
      )}
    </Space>
  );
};

export default AssignStaffShift;
