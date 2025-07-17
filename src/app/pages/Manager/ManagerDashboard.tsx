import React, { useEffect, useState } from 'react';
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
import axiosInstance from '../../../settings/axiosInstance';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Typography } from 'antd';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const ManagerDashboard: React.FC = () => {
  if (!checkUserRole(['MANAGER'])) {
    return <Navigate to="/unauthorized" replace />;
  }

  const [recentTicketSales, setRecentTicketSales] = useState<any[]>([]);
  const [ticketPagination, setTicketPagination] = useState({
    current: 1,
    pageSize: 3,
    total: 0,
  });


  const fetchRecentTicketSales = async (page = 1, pageSize = 3) => {
    const dateTo = dayjs();
    const dateFrom = dateTo.subtract(7, 'day');

    try {
      const response = await axiosInstance.get('/api/DashBoard/ticket-statistics', {
        params: {
          dateFrom: dateFrom.format('YYYY-MM-DDT00:00:00'),
          dateTo: dateTo.format('YYYY-MM-DDT23:59:59'),
          isAccendingCreated: false,
          pageNumber: page,
          pageSize: pageSize,
        },
      });

      const data = response.data?.result ?? [];
      const total = response.data?.result.length ?? 0;

      const transformed = data.map((item: any, index: number) => ({
        key: item.orderCode ?? index,
        ticketId: item.orderCode ?? `TCKT-${index}`,
        customer: item.userFullName ?? 'Không rõ',
        event: item.detailTicket[0] ?? 'Không rõ',
        time: item.timeOfPurchase,
        status: item.paymentStatus ?? 'completed',
      }));

      setRecentTicketSales(transformed);
      setTicketPagination({
        current: page,
        pageSize,
        total,
      });
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu ticket-statistics:', err);
    }
  };

  useEffect(() => {
    fetchRecentTicketSales(ticketPagination.current, ticketPagination.pageSize);
  }, []);

  const handleTicketTableChange = (pagination: any) => {
    fetchRecentTicketSales(pagination.current, pagination.pageSize);
  };

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
        const statusConfig: Record<string, { color: string; text: string }> = {
          'Đã thanh toán': { color: 'success', text: 'Đã thanh toán' },
          'Chưa thanh toán': { color: 'error', text: 'Chưa thanh toán' },
        };

        const config = statusConfig[status] || {
          color: 'default',
          text: status || 'Không rõ',
        };

        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  const activityColumns = [
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

  return (
    <div className="w-full h-full p-2 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      </div>

      
      {/* --- Recent Ticket Sales Table --- */}
      <div className="mb-6">
        <Card title="Giao dịch vé gần đây" className="h-full">
          <Table
            dataSource={recentTicketSales}
            columns={ticketColumns}
            pagination={{
              current: ticketPagination.current,
              pageSize: ticketPagination.pageSize,
              total: ticketPagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} giao dịch`,
              responsive: true,
            }}
            onChange={handleTicketTableChange}
            scroll={{ x: 'max-content' }}
            className="w-full"
            size="middle"
          />
        </Card>
      </div>

      {/* --- Monthly Goals --- */}
      <div className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={24}>
            <Card title="Mục tiêu hàng tháng" className="h-full">
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
        </Row>
      </div>
    </div>
  );
};

export default ManagerDashboard;
