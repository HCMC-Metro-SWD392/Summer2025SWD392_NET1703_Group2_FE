import { RollbackOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Descriptions, message, Space, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PromotionApi } from '../../../../api/promotion/PromotionApi';
import type { GetPromotionDTO } from '../../../../api/promotion/PromotionInterface';
import { PromotionType } from '../../../../api/promotion/PromotionInterface';

const { RangePicker } = DatePicker;
const { Title } = Typography;

// Helper to get promotion type string from number or string enum
const getPromotionTypeString = (type: PromotionType | number): string => {
  if (typeof type === 'number') {
    return type === 0 ? PromotionType.Percentage : PromotionType.FixedAmount;
  }
  return type;
};

const PromotionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState<GetPromotionDTO | null>(null);

  useEffect(() => {
    fetchPromotionDetails();
  }, [id]);

  const fetchPromotionDetails = async () => {
    if (!id) return;
    
    try {
      setInitialLoading(true);
      const response = await PromotionApi.getPromotionById(id);
      
      if (response.isSuccess && response.result) {
        const promotion = response.result;
        setPromotion(promotion);
      } else {
        message.error(response.message || 'Failed to fetch promotion details');
        navigate('/manager/promotion'); // Navigate back on error
      }
    } catch (error) {
      message.error('Failed to fetch promotion details');
      console.error('Error fetching promotion details:', error);
      navigate('/manager/promotion'); // Navigate back on error
    } finally {
      setInitialLoading(false);
    }
  };

  if (initialLoading || !promotion) {
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
            onClick={() => navigate('/manager/promotion')}
          >
            Quay Lại
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Chi Tiết Khuyến Mãi
          </Title>
        </Space>
      </Space>

      <Card title="Thông Tin Khuyến Mãi">
        <Descriptions bordered column={{
          xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2
        }}>
          <Descriptions.Item label="Mã Khuyến Mãi" span={2}>{
            promotion?.code
          }</Descriptions.Item>
          <Descriptions.Item label="Loại Khuyến Mãi" span={2}>
            {
              getPromotionTypeString(promotion?.promotionType as PromotionType | number) === PromotionType.Percentage
                ? 'Giảm Giá Theo Phần Trăm'
                : 'Giảm Giá Cố Định'
            }
          </Descriptions.Item>
          <Descriptions.Item label="Mô Tả" span={2}>{
            promotion?.description
          }</Descriptions.Item>
          {
            getPromotionTypeString(promotion?.promotionType as PromotionType | number) === PromotionType.Percentage ? (
              <Descriptions.Item label="Phần Trăm Giảm Giá" span={2}>{
                `${promotion?.percentage ?? 'N/A'}%`
              }</Descriptions.Item>
            ) : (
              <Descriptions.Item label="Số Tiền Giảm Giá" span={2}>{
                `${promotion?.fixedAmount ?? 'N/A'} đ`
              }</Descriptions.Item>
            )
          }
          <Descriptions.Item label="Thời Gian Áp Dụng" span={2}>
            {
              promotion?.startDate && promotion?.endDate
                ? `${dayjs(promotion.startDate).format('YYYY-MM-DD HH:mm')} - ${dayjs(promotion.endDate).format('YYYY-MM-DD HH:mm')}`
                : 'N/A'
            }
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
};

export default PromotionDetails; 