import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Space,
  Typography,
  Button,
  Table,
  Tag,
  Spin,
  message,
  Divider,
  Row,
  Col,
  Statistic,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  ArrowLeftOutlined, 
  EditOutlined,
  EnvironmentOutlined,
  SwapOutlined,
  NumberOutlined,
} from '@ant-design/icons';
import { MetroLineApi } from '../../../../api/metroLine/MetroLineApi';
import type { GetMetroLineDTO, GetMetroLineStationDTO } from '../../../../api/metroLine/MetroLineInterface';

const { Title } = Typography;

const MetroLineDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [metroLine, setMetroLine] = useState<GetMetroLineDTO | null>(null);

  useEffect(() => {
    if (id) {
      fetchMetroLineDetails();
    }
  }, [id]);

  const fetchMetroLineDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await MetroLineApi.getMetroLineById(id);
      
      if (response.isSuccess && response.result) {
        setMetroLine(response.result);
      } else {
        message.error(response.message || 'Không thể tải thông tin tuyến Metro');
        navigate('/manager/metro-line');
      }
    } catch (error) {
      console.error('Error fetching metro line details:', error);
      message.error('Có lỗi xảy ra khi tải thông tin tuyến Metro');
      navigate('/manager/metro-line');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<GetMetroLineStationDTO> = [
    {
      title: 'Thứ Tự',
      dataIndex: 'stationOrder',
      key: 'stationOrder',
      width: 80,
      align: 'center',
    },
    {
      title: 'Tên Trạm',
      dataIndex: ['station', 'name'],
      key: 'stationName',
      render: (_, record) => (
        <Space>
          {record.station.name}
          {record.station.id === metroLine?.startStation?.id && (
            <Tag color="green">Trạm Bắt Đầu</Tag>
          )}
          {record.station.id === metroLine?.endStation?.id && (
            <Tag color="red">Trạm Kết Thúc</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Địa Chỉ',
      dataIndex: ['station', 'address'],
      key: 'stationAddress',
      render: (address: string | undefined) => address || 'N/A',
    },
    {
      title: 'Khoảng Cách (km)',
      dataIndex: 'distanceFromStart',
      key: 'distanceFromStart',
      align: 'right',
      render: (distance: number) => distance.toFixed(1),
    },
  ];

  if (!metroLine) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/manager/metro-line')}
          >
            Quay lại
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Chi Tiết Tuyến Metro {metroLine.metroLineNumber}
          </Title>
        </Space>
      </Space>

      <Row gutter={24}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Số Tuyến"
              value={metroLine.metroLineNumber}
              prefix={<NumberOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng Số Trạm"
              value={metroLine.metroLineStations.length}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng Khoảng Cách"
              value={metroLine.metroLineStations[metroLine.metroLineStations.length - 1]?.distanceFromStart || 0}
              suffix="km"
              precision={1}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Thông Tin Tuyến">
        <Descriptions bordered>
          <Descriptions.Item label="Số Tuyến" span={3}>
            Tuyến {metroLine.metroLineNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Tên Tuyến" span={3}>
            {metroLine.metroName || 'Chưa đặt tên'}
          </Descriptions.Item>
          <Descriptions.Item label="Trạm Bắt Đầu" span={3}>
            {metroLine.startStation?.name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Địa Chỉ Trạm Bắt Đầu" span={3}>
            {metroLine.startStation?.address || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Trạm Kết Thúc" span={3}>
            {metroLine.endStation?.name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Địa Chỉ Trạm Kết Thúc" span={3}>
            {metroLine.endStation?.address || 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card 
        title="Danh Sách Trạm" 
        extra={
          <Tag color="blue">
            Tổng số: {metroLine.metroLineStations.length} trạm
          </Tag>
        }
      >
        <Table
          columns={columns}
          dataSource={metroLine.metroLineStations}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{
            emptyText: 'Không có dữ liệu',
          }}
        />
      </Card>
    </Space>
  );
};

export default MetroLineDetails;
