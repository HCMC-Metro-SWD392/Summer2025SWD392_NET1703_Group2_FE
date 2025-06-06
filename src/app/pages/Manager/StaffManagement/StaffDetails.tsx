import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Spin,
  Descriptions,
  Space,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;

// Interfaces
interface ApplicationUser {
  id: string;
  fullName: string | null;
  address: string | null;
  sex: string | null;
  dateOfBirth: string | null;
  identityId: string | null;
  email: string;
  phoneNumber: string;
}

interface StaffShift {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
}

interface StaffSchedule {
  id: string;
  shiftId: string;
  staffId: string;
  workingDate: string;
  status: string;
  shift: StaffShift;
}

interface Staff {
  id: string;
  userId: string;
  user: ApplicationUser;
  staffSchedules: StaffSchedule[];
}

const StaffDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        const response = await fetch(`/api/staff/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch staff details');
        }
        const data = await response.json();
        setStaff(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDetails();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<StaffSchedule> = [
    {
      title: 'Date',
      dataIndex: 'workingDate',
      key: 'workingDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
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
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography.Text type="danger">{error}</Typography.Text>
      </div>
    );
  }

  if (!staff) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography.Text>Staff not found</Typography.Text>
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Title level={2}>Staff Details</Title>

      <Row gutter={[24, 24]}>
        {/* Personal Information Card */}
        <Col xs={24} md={12}>
          <Card title="Personal Information">
            <Descriptions column={1}>
              <Descriptions.Item label="Full Name">
                {staff.user.fullName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {staff.user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {staff.user.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {staff.user.address || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {staff.user.dateOfBirth
                  ? dayjs(staff.user.dateOfBirth).format('DD/MM/YYYY')
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Sex">
                {staff.user.sex || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Identity ID">
                {staff.user.identityId || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Schedule Card */}
        <Col xs={24} md={12}>
          <Card title="Work Schedule">
            <Table
              columns={columns}
              dataSource={staff.staffSchedules}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default StaffDetails;
