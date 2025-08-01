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
  ExclamationCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { MetroLineApi } from '../../../../api/metroLine/MetroLineApi';
import { MetroLineStationApi } from '../../../../api/metroLine/MetroLineStationApi';
import type { GetMetroLineDTO, GetMetroLineStationDTO } from '../../../../api/metroLine/MetroLineInterface';
import { MetroLineStatus } from '../../../../api/metroLine/MetroLineInterface';
import type { GetStationDTO } from '../../../../api/station/StationInterface';
import { StationApi } from '../../../../api/station/StationApi';

const { Title } = Typography;
const { confirm } = Modal;

const statusMap = {
  0: { text: "Hoạt động bình thường", color: "text-green-500" }, // Normal
  1: { text: "Bị lỗi", color: "text-red-500" },                  // Faulty
  2: { text: "Bị chậm", color: "text-yellow-500" },              // Delayed
};

const MetroLineDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [metroLine, setMetroLine] = useState<GetMetroLineDTO | null>(null);
  const [stations, setStations] = useState<GetStationDTO[]>([]);
  const [metroLineStations, setMetroLineStations] = useState<GetMetroLineStationDTO[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingStation, setEditingStation] = useState<GetMetroLineStationDTO | null>(null);
  const [editDistance, setEditDistance] = useState<number>(0);
  const [editOrder, setEditOrder] = useState<number>(1);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<MetroLineStatus>(MetroLineStatus.Normal);

  useEffect(() => {
    if (id) {
      fetchMetroLineDetails();
      fetchStations();
      fetchMetroLineStations();
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
        navigate('/admin/metro-line');
      }
    } catch (error) {
      console.error('Error fetching metro line details:', error);
      message.error('Có lỗi xảy ra khi tải thông tin tuyến Metro');
      navigate('/admin/metro-line');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetroLineStations = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await MetroLineStationApi.getStationByMetroLineId(id, true);
      if (response.isSuccess && response.result) {
        setMetroLineStations(response.result);
      } else {
        message.error(response.message || 'Không thể tải danh sách trạm');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải danh sách trạm');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!id) return;
    
    console.log('Frontend - Changing status for metro line:', id, 'to status:', selectedStatus);
    setLoading(true);
    try {
      const response = await MetroLineApi.changeMetroLineStatus(id, selectedStatus);
      console.log('Frontend - API response:', response);
      if (response.isSuccess) {
        message.success('Thay đổi trạng thái thành công');
        setStatusModalVisible(false);
        fetchMetroLineDetails(); // Refresh the metro line data
      } else {
        message.error(response.message || 'Không thể thay đổi trạng thái');
      }
    } catch (error) {
      console.error('Error changing metro line status:', error);
      message.error('Có lỗi xảy ra khi thay đổi trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Thứ Tự',
      dataIndex: 'stationOrder',
      key: 'stationOrder',
      width: 80,
      align: 'center',
      sorter: (a, b) => (a.stationOrder ?? 0) - (b.stationOrder ?? 0),
      defaultSortOrder: 'ascend',
      render: (stationOrder: number, _record: any, index: number) =>
        typeof stationOrder === 'number' ? stationOrder : index + 1,
    },
    {
      title: 'Tên Trạm',
      dataIndex: ['station', 'name'],
      key: 'stationName',
      render: (_: any, record: any) => record.station?.name || 'N/A',
    },
    {
      title: 'Địa Chỉ',
      dataIndex: ['station', 'address'],
      key: 'stationAddress',
      render: (_: any, record: any) => record.station?.address || 'N/A',
    },
    {
      title: 'Khoảng Cách (km)',
      dataIndex: 'distanceFromStart',
      key: 'distanceFromStart',
      align: 'right',
      render: (distance: number | undefined) =>
        typeof distance === 'number' ? distance.toFixed(1) : 'N/A',
    },
    {
      title: 'Hành Động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingStation(record);
              setEditDistance(record.distanceFromStart);
              setEditOrder(record.stationOrder);
              setEditModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Button
            danger
            onClick={() => {
              confirm({
                title: 'Bạn có chắc muốn xóa trạm này khỏi tuyến?',
                icon: <ExclamationCircleOutlined />,
                okText: 'Xóa',
                okType: 'danger',
                cancelText: 'Hủy',
                onOk: async () => {
                  setLoading(true);
                  try {
                    const res = await MetroLineApi.removeMetroLineStation(record.id);
                    if (res.isSuccess) {
                      message.success('Xóa trạm thành công');
                      fetchMetroLineStations();
                    } else {
                      message.error(res.message || 'Không thể xóa trạm');
                    }
                  } finally {
                    setLoading(false);
                  }
                },
              });
            }}
          >
            Xóa
          </Button>
        </Space>
      ),
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
            onClick={() => navigate('/admin/metro-line')}
          >
            Quay lại
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Chi Tiết Tuyến Metro {metroLine.metroLineNumber}
          </Title>
        </Space>
        <Button
          type="primary"
          icon={<SettingOutlined />}
          onClick={() => {
            setSelectedStatus(metroLine.status);
            setStatusModalVisible(true);
          }}
        >
          Thay Đổi Trạng Thái
        </Button>
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
          <Descriptions.Item label="Trạng Thái Hoạt Động" span={3}>
            <span className={statusMap[metroLine.status]?.color || "text-gray-500"}>
              {statusMap[metroLine.status]?.text || "Không xác định"}
            </span>
          </Descriptions.Item>
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
              Tổng số: {metroLineStations.length} trạm
            </Tag>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={metroLineStations}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{
            emptyText: 'Không có dữ liệu',
          }}
        />
      </Card>

      <Modal
        title="Cập Nhật Trạm Tuyến Metro"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={async () => {
          if (!editingStation) return;
          setLoading(true);
          try {
            const res = await MetroLineApi.updateMetroLineStation(editingStation.id, {
              distanceFromStart: editDistance,
              stationOrder: editOrder,
            });
            if (res.isSuccess) {
              message.success('Cập nhật trạm thành công');
              setEditModalVisible(false);
              setEditingStation(null);
              fetchMetroLineStations();
            } else {
              message.error(res.message || 'Không thể cập nhật trạm');
            }
          } finally {
            setLoading(false);
          }
        }}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form layout="vertical">
          <Form.Item label="Khoảng Cách (km)">
            <InputNumber
              min={0}
              step={0.1}
              value={editDistance}
              onChange={value => setEditDistance(value ?? 0)}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="Thứ Tự">
            <InputNumber
              min={1}
              max={(metroLine?.metroLineStations.length || 0)}
              value={editOrder}
              onChange={value => setEditOrder(value ?? 1)}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thay Đổi Trạng Thái Tuyến Metro"
        visible={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onOk={handleStatusChange}
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form layout="vertical">
          <Form.Item label="Trạng Thái">
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
            >
              <Select.Option value={MetroLineStatus.Normal}>
                Hoạt động bình thường
              </Select.Option>
              <Select.Option value={MetroLineStatus.Faulty}>
                Bị lỗi
              </Select.Option>
              <Select.Option value={MetroLineStatus.Delayed}>
                Bị chậm
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default MetroLineDetails;
