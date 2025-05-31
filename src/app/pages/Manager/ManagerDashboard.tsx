import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';

const ManagerDashboard: React.FC = () => {
  // Mock data
  const recentActivities = [
    {
      key: '1',
      user: 'John Doe',
      action: 'Created new order',
      time: '2 hours ago',
      status: 'success',
    },
    {
      key: '2',
      user: 'Jane Smith',
      action: 'Updated inventory',
      time: '3 hours ago',
      status: 'processing',
    },
    {
      key: '3',
      user: 'Mike Johnson',
      action: 'Cancelled order',
      time: '5 hours ago',
      status: 'error',
    },
  ];

  // Mock data for recent ticket sales
  const recentTicketSales = [
    {
      key: '1',
      ticketId: 'TCKT-1001',
      customer: 'Nguyen Van A',
      event: 'Metro Line 1',
      time: '10 minutes ago',
      status: 'completed',
    },
    {
      key: '2',
      ticketId: 'TCKT-1002',
      customer: 'Tran Thi B',
      event: 'Metro Line 2',
      time: '30 minutes ago',
      status: 'pending',
    },
    {
      key: '3',
      ticketId: 'TCKT-1003',
      customer: 'Le Van C',
      event: 'Metro Line 1',
      time: '1 hour ago',
      status: 'failed',
    },
  ];

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          success: { color: 'success', text: 'Success' },
          processing: { color: 'processing', text: 'Processing' },
          error: { color: 'error', text: 'Failed' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  const ticketColumns = [
    {
      title: 'Ticket ID',
      dataIndex: 'ticketId',
      key: 'ticketId',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Event',
      dataIndex: 'event',
      key: 'event',
    },
    {
      title: 'Purchase Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          completed: { color: 'success', text: 'Completed' },
          pending: { color: 'processing', text: 'Pending' },
          failed: { color: 'error', text: 'Failed' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div className="mt-2">
              <span className="text-green-500">
                <RiseOutlined /> 12%
              </span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Tickets Bought"
              value={93}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="mt-2">
              <span className="text-green-500">
                <RiseOutlined /> 8%
              </span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={11280}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
            <div className="mt-2">
              <span className="text-red-500">
                <FallOutlined /> 3%
              </span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Conversion Rate"
              value={68}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
            <div className="mt-2">
              <span className="text-green-500">
                <RiseOutlined /> 5%
              </span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Progress Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Monthly Goals">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Sales Target</span>
                  <span>75%</span>
                </div>
                <Progress percent={75} status="active" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Customer Satisfaction</span>
                  <span>90%</span>
                </div>
                <Progress percent={90} status="active" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>New Users</span>
                  <span>60%</span>
                </div>
                <Progress percent={60} status="active" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Ticket Sales">
            <Table
              dataSource={recentTicketSales}
              columns={ticketColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ManagerDashboard;
