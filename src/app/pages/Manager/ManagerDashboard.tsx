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
import { RevenueApi } from '../../../api/revenue/RevenueApi';

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
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [customerLoading, setCustomerLoading] = useState<boolean>(true);
  const [ticketCount, setTicketCount] = useState<number>(0);
  const [ticketCountLoading, setTicketCountLoading] = useState<boolean>(true);
  const [revenue, setRevenue] = useState<number>(0);
  const [revenueLoading, setRevenueLoading] = useState<boolean>(true);

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
        event: item.detailTicket[0] ?? 'Mua vé vượt',
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

  const fetchTicketCount = async () => {
    const dateTo = dayjs();
    const dateFrom = dateTo.subtract(7, 'day');
    setTicketCountLoading(true);
    try {
      // Main ticket statistics
      const response = await axiosInstance.get('/api/DashBoard/ticket-statistics', {
        params: {
          dateFrom: dateFrom.format('YYYY-MM-DDT00:00:00'),
          dateTo: dateTo.format('YYYY-MM-DDT23:59:59'),
          isAccendingCreated: false,
          pageNumber: 1,
          pageSize: 5,
        },
      });
      setTicketCount(response.data?.result?.length ?? 0);
    } catch {
      setTicketCount(0);
    }
    setTicketCountLoading(false);
  };

  const fetchCustomerCount = async () => {
    setCustomerLoading(true);
    try {
      const res = await axiosInstance.get('/api/DashBoard/customer-statistics-number');
      setCustomerCount(res.data?.result ?? 0);
    } catch {
      setCustomerCount(0);
    } finally {
      setCustomerLoading(false);
    }
  };

  const fetchRevenue = async () => {
    setRevenueLoading(true);
    try {
      const month = dayjs().month() + 1;
      const res = await RevenueApi.viewRevenueMonth(month);
      setRevenue(res.result ?? 0);
    } catch {
      setRevenue(0);
    } finally {
      setRevenueLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketCount();
    fetchCustomerCount();
    fetchRevenue();
    fetchRecentTicketSales(ticketPagination.current, ticketPagination.pageSize);
  }, []);

  const handleTicketTableChange = (pagination: any) => {
    fetchRecentTicketSales(pagination.current, pagination.pageSize);
  };

  const ticketColumns = [
    {
      title: 'Mã giao dịch',
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

      {/* Statistics Cards */}
      <div className="mb-6">
        <Row gutter={[16, 16]} justify="center" align="middle" style={{ width: '100%' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Statistic
                  title="Tổng số khách hàng"
                  value={customerLoading ? undefined : customerCount}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                  loading={customerLoading}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Statistic
                  title="Tổng số vé đã bán"
                  value={ticketCountLoading ? undefined : ticketCount}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                  loading={ticketCountLoading}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Statistic
                  title="Doanh thu tháng này"
                  value={revenueLoading ? undefined : revenue}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                  loading={revenueLoading}
                />
              </div>
            </Card>
          </Col>
        </Row>
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

    </div>
  );
};

export default ManagerDashboard;
