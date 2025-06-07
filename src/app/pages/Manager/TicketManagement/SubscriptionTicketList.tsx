import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  message,
  Tag,
  Tooltip,
  Spin,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TicketApi } from '../../../../api/ticket/TicketApi';
import type { GetSubscriptionTicketDTO } from '../../../../api/ticket/TicketInterface';
import { SubscriptionTicketType, TICKET_TYPE_CONFIG } from '../../../../api/ticket/TicketInterface';
import dayjs from 'dayjs';

const { Title } = Typography;

const SubscriptionTicketList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<GetSubscriptionTicketDTO[]>([]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await TicketApi.getAllSubscriptions();
      if (response.isSuccess && response.result) {
        setTickets(response.result);
      } else {
        message.error(response.message || 'Không thể lấy danh sách vé');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      message.error('Có lỗi xảy ra khi lấy danh sách vé');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getTicketTypeLabel = (type: SubscriptionTicketType) => {
    return TICKET_TYPE_CONFIG[type]?.label || type;
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const columns = [
    {
      title: 'Tên Vé',
      dataIndex: 'ticketName',
      key: 'ticketName',
      width: '20%',
    },
    {
      title: 'Loại Vé',
      dataIndex: 'ticketType',
      key: 'ticketType',
      width: '15%',
      render: (type: SubscriptionTicketType) => (
        <Tag color="blue">{getTicketTypeLabel(type)}</Tag>
      ),
    },
    {
      title: 'Giá Vé',
      dataIndex: 'price',
      key: 'price',
      width: '15%',
      render: (price: number) => formatPrice(price),
    },
    {
      title: 'Ngày Bắt Đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      width: '15%',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Ngày Kết Thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      width: '15%',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: '20%',
      render: (_: any, record: GetSubscriptionTicketDTO) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button type="link" onClick={() => navigate(`/manager/tickets/${record.id}`)}>
              Chi tiết
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={2}>Danh Sách Vé Đăng Ký</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/manager/tickets/create')}
        >
          Tạo Vé Mới
        </Button>
      </Space>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={tickets}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} vé`,
            }}
          />
        </Spin>
      </Card>
    </Space>
  );
};

export default SubscriptionTicketList;
