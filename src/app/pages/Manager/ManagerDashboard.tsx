import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { checkUserRole } from '../../../api/auth/auth';
import { Navigate } from 'react-router-dom';

const ManagerDashboard: React.FC = () => {

  if (!checkUserRole(["MANAGER"])) {
        return <Navigate to="/unauthorized" replace />;
    }

  // Mock data
  const recentActivities = [
    {
      key: '1',
      user: 'John Doe',
      action: 'Tạo đơn hàng mới',
      time: '2 giờ trước',
      status: 'success',
    },
    {
      key: '2',
      user: 'Jane Smith',
      action: 'Cập nhật kho',
      time: '3 giờ trước',
      status: 'processing',
    },
    {
      key: '3',
      user: 'Mike Johnson',
      action: 'Hủy đơn hàng',
      time: '5 giờ trước',
      status: 'error',
    },
  ];

  // Mock data for recent ticket sales
  const recentTicketSales = [
    {
      key: '1',
      ticketId: 'TCKT-1001',
      customer: 'Nguyễn Văn A',
      event: 'Tuyến Metro 1',
      time: '10 phút trước',
      status: 'completed',
    },
    {
      key: '2',
      ticketId: 'TCKT-1002',
      customer: 'Tran Thi B',
      event: 'Tuyến Metro 2',
      time: '30 phút trước',
      status: 'pending',
    },
    {
      key: '3',
      ticketId: 'TCKT-1003',
      customer: 'Le Van C',
      event: 'Tuyến Metro 1',
      time: '1 giờ trước',
      status: 'failed',
    },
  ];

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          success: { color: 'success', text: 'Thành công' },
          processing: { color: 'processing', text: 'Đang xử lý' },
          error: { color: 'error', text: 'Thất bại' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  const ticketColumns = [
    {
      title: 'Mã vé',
      dataIndex: 'ticketId',
      key: 'ticketId',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Sự kiện',
      dataIndex: 'event',
      key: 'event',
    },
    {
      title: 'Thời gian mua',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          completed: { color: 'success', text: 'Hoàn thành' },
          pending: { color: 'processing', text: 'Đang chờ' },
          failed: { color: 'error', text: 'Thất bại' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  return (
    <div className="w-full h-full p-2 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Bảng điều khiển</h1>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full">
              <Statistic
                title="Tổng số khách hàng"
                value={1128}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
              <div className="mt-2">
                <span className="text-green-500">
                  <RiseOutlined /> 12%
                </span>
                <span className="text-gray-500 ml-2">so với tháng trước</span>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full">
              <Statistic
                title="Tổng số vé đã bán"
                value={93}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="mt-2">
                <span className="text-green-500">
                  <RiseOutlined /> 8%
                </span>
                <span className="text-gray-500 ml-2">so với tháng trước</span>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full">
              <Statistic
                title="Doanh thu"
                value={11280}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
              <div className="mt-2">
                <span className="text-red-500">
                  <FallOutlined /> 3%
                </span>
                <span className="text-gray-500 ml-2">so với tháng trước</span>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full">
              <Statistic
                title="Tỷ lệ chuyển đổi"
                value={68}
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="mt-2">
                <span className="text-green-500">
                  <RiseOutlined /> 5%
                </span>
                <span className="text-gray-500 ml-2">so với tháng trước</span>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Progress and Recent Sales Section */}
      <div className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card 
              title="Mục tiêu hàng tháng" 
              className="h-full"
              headStyle={{ fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Mục tiêu doanh số</span>
                  </div>
                  <Progress percent={75} status="active" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Sự hài lòng của khách hàng</span>
                  </div>
                  <Progress percent={90} status="active" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Người dùng mới</span>
                  </div>
                  <Progress percent={60} status="active" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card 
              title="Giao dịch vé gần đây" 
              className="h-full"
              headStyle={{ fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              <div className="w-full overflow-hidden">
                <Table
                  dataSource={recentTicketSales}
                  columns={ticketColumns}
                  pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} giao dịch`,
                    responsive: true,
                  }}
                  scroll={{ x: 'max-content' }}
                  className="w-full"
                  size="middle"
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Recent Activities Section */}
      <div className="mb-6">
        <Card 
          title="Hoạt động gần đây" 
          className="w-full"
          headStyle={{ fontSize: '1.1rem', fontWeight: 'bold' }}
        >
          <div className="w-full overflow-hidden">
            <Table
              dataSource={recentActivities}
              columns={columns}
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} hoạt động`,
                responsive: true,
              }}
              scroll={{ x: 'max-content' }}
              className="w-full"
              size="middle"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
