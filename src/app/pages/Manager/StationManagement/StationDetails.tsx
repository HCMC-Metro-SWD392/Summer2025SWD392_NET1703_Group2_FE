import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  message,
  Space,
  Typography,
  Spin,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { StationApi } from '../../../../api/station/StationApi';
import type { Station } from '../../../../api/station/StationInterface';

const { Title } = Typography;

const StationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [station, setStation] = useState<Station | null>(null);

  useEffect(() => {
    const fetchStationData = async () => {
      if (!id) {
        message.error('Không tìm thấy ID trạm');
        navigate('/manager/station');
        return;
      }

      try {
        setLoading(true);
        const response = await StationApi.getStationById(id);
        
        if (response.isSuccess && response.result) {
          setStation(response.result);
        } else {
          message.error(response.message || 'Không thể tải thông tin trạm');
          navigate('/manager/station');
        }
      } catch (error) {
        console.error('Error fetching station:', error);
        message.error('Có lỗi xảy ra khi tải thông tin trạm');
        navigate('/manager/station');
      } finally {
        setLoading(false);
      }
    };

    fetchStationData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Đang tải thông tin trạm..." />
      </div>
    );
  }

  if (!station) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography.Text>Không tìm thấy thông tin trạm</Typography.Text>
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/manager/station')}
        >
          Quay lại
        </Button>
        <Title level={2} style={{ margin: 0 }}>Chi Tiết Trạm Metro</Title>
      </Space>

      <Card>
        <Descriptions title="Thông Tin Cơ Bản" bordered>
          <Descriptions.Item label="Tên Trạm" span={3}>
            {station.name}
          </Descriptions.Item>
          <Descriptions.Item label="Địa Chỉ" span={3}>
            {station.address || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Mô Tả" span={3}>
            {station.description || 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
};

export default StationDetails;
