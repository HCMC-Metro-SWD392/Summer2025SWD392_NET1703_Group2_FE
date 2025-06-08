import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Space,
  Spin,
  Typography,
  message,
} from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { TicketApi } from '../../../../api/ticket/TicketApi';
import type {
  GetSubscriptionTicketDTO,
} from '../../../../api/ticket/TicketInterface';
import {
  SubscriptionTicketType,
  TICKET_TYPE_CONFIG
} from '../../../../api/ticket/TicketInterface';

const { Title } = Typography;

// Helper to get subscription ticket type string from enum or number
const getSubscriptionTicketTypeString = (type: SubscriptionTicketType | number): string => {
  if (typeof type === 'number') {
    switch (type) {
      case 1:
        return SubscriptionTicketType.DAILY;
      case 2:
        return SubscriptionTicketType.WEEKLY;
      case 3:
        return SubscriptionTicketType.MONTHLY;
      case 4:
        return SubscriptionTicketType.YEARLY;
      default:
        return 'N/A';
    }
  }
  return TICKET_TYPE_CONFIG[type]?.label || 'N/A';
};

const SubscriptionTicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [subscriptionTicket, setSubscriptionTicket] = useState<GetSubscriptionTicketDTO | null>(null);

  useEffect(() => {
    if (id) {
      fetchSubscriptionTicketDetails();
    }
  }, [id]);

  const fetchSubscriptionTicketDetails = async () => {
    if (!id) return;

    try {
      setInitialLoading(true);
      const response = await TicketApi.getSubscriptionById(id);

      if (response.isSuccess && response.result) {
        setSubscriptionTicket(response.result);
      } else {
        message.error(response.message || 'Không thể tải thông tin vé đăng ký');
        navigate('/manager/subscription-ticket');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải thông tin vé đăng ký');
      console.error('Error fetching subscription ticket details:', error);
      navigate('/manager/subscription-ticket');
    } finally {
      setInitialLoading(false);
    }
  };

  if (initialLoading || !subscriptionTicket) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Space>
          <Button
            icon={<RollbackOutlined />}
            onClick={() => navigate('/manager/subscription-ticket')}
          >
            Quay Lại
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Chi Tiết Vé Đăng Ký
          </Title>
        </Space>
      </Space>

      <Card title="Thông Tin Vé Đăng Ký">
        <Descriptions bordered column={{
          xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2
        }}>
          <Descriptions.Item label="Tên Vé" span={2}>{
            subscriptionTicket?.ticketName
          }</Descriptions.Item>
          <Descriptions.Item label="Loại Vé" span={2}>
            {
              getSubscriptionTicketTypeString(subscriptionTicket.ticketType)
            }
          </Descriptions.Item>
          <Descriptions.Item label="Giá Tiền" span={2}>
            {
              `${subscriptionTicket?.price?.toLocaleString('vi-VN')} đ`
            }
          </Descriptions.Item>
          <Descriptions.Item label="Thời hạn" span={2}>
            {
              `${subscriptionTicket?.expiration ?? 'N/A'} ngày`
            }
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
};

export default SubscriptionTicketDetails;
