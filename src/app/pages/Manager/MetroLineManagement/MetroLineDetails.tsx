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
  Modal,
  Select,
  InputNumber,
  Form,
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
import { MetroLineStationApi } from '../../../../api/metroLine/MetroLineStationApi';
import type { GetMetroLineDTO, GetMetroLineStationDTO } from '../../../../api/metroLine/MetroLineInterface';
import type { GetStationDTO } from '../../../../api/station/StationInterface';
import { StationApi } from '../../../../api/station/StationApi';

const { Title } = Typography;

const MetroLineDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [metroLine, setMetroLine] = useState<GetMetroLineDTO | null>(null);
  const [addStationVisible, setAddStationVisible] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [distanceFromStart, setDistanceFromStart] = useState<number>(0);
  const [stationOrder, setStationOrder] = useState<number>(1);
  const [stations, setStations] = useState<GetStationDTO[]>([]);

  useEffect(() => {
    if (id) {
      fetchMetroLineDetails();
      fetchStations();
    }
  }, [id]);


  const fetchStations = async () => {
      const response = await StationApi.getAllStations();
      if (response.isSuccess && response.result) {
        setStations(response.result);
      }
    };

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
      sorter: (a, b) => a.stationOrder - b.stationOrder,
      defaultSortOrder: 'ascend',
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
        <Col span={12}>
          <Card>
            <Statistic
              title="Số Tuyến"
              value={metroLine.metroLineNumber}
              prefix={<NumberOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="Tổng Số Trạm"
              value={metroLine.metroLineStations.length}
              prefix={<EnvironmentOutlined />}
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
          <Space>
            <Tag color="blue">
              Tổng số: {metroLine.metroLineStations.length} trạm
            </Tag>
            {/* <Button type="primary" onClick={() => {
              setStationOrder((metroLine?.metroLineStations.length || 0) + 1);
              setSelectedStationId(null);
              setDistanceFromStart(0);
              setAddStationVisible(true);
            }}>
              Thêm Trạm Vào Tuyến
            </Button> */}
          </Space>
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

      <Modal
        title="Thêm Trạm Vào Tuyến"
        visible={addStationVisible}
        onCancel={() => {
          setAddStationVisible(false);
          setSelectedStationId(null);
          setDistanceFromStart(0);
          setStationOrder((metroLine?.metroLineStations.length || 0) + 1);
        }}
        onOk={async () => {
          if (!selectedStationId || !metroLine) {
            message.error('Vui lòng chọn trạm');
            return; 
          }
          // Call API to add station
          try {
            setLoading(true);
            const res = await MetroLineStationApi.createMetroLineStation({
              metroLineId: metroLine.id,
              stationId: selectedStationId,
              distanceFromStart,
              stationOder: stationOrder,
            });
            if (res.isSuccess) {
              message.success('Thêm trạm thành công');
              setAddStationVisible(false);
              setSelectedStationId(null);
              setDistanceFromStart(0);
              setStationOrder((metroLine?.metroLineStations.length || 0) + 1);
              fetchMetroLineDetails(); // Refresh details
            } else {
              message.error(res.message || 'Không thể thêm trạm');
            }
          } finally {
            setLoading(false);
          }
        }}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form layout="vertical">
          <Form.Item label="Chọn Trạm">
            <Select
              showSearch
              placeholder="Chọn trạm"
              value={selectedStationId}
              onChange={setSelectedStationId}
              style={{ width: '100%' }}
              filterOption={(input, option) =>
                ((option?.children as unknown) as string).toLowerCase().includes(input.toLowerCase())
              }
            >
              {stations
                .filter(station => !metroLine?.metroLineStations.some(ms => ms.station.id === station.id))
                .map(station => (
                  <Select.Option key={station.id} value={station.id}>
                    {station.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item label="Khoảng Cách (km)">
            <InputNumber
              min={0}
              step={0.1}
              value={distanceFromStart}
              onChange={value => setDistanceFromStart(value ?? 0)}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="Thứ Tự">
            <InputNumber
              min={1}
              max={(metroLine?.metroLineStations.length || 0) + 1}
              value={stationOrder}
              onChange={value => setStationOrder(value ?? 1)}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default MetroLineDetails;
