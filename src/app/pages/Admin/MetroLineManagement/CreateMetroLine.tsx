import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Space,
  Typography,
  Select,
  Table,
  message,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import { DeleteOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MetroLineApi } from '../../../../api/metroLine/MetroLineApi';
import { StationApi } from '../../../../api/station/StationApi';
import { MetroLineStationApi } from '../../../../api/metroLine/MetroLineStationApi';
import type { CreateMetroLineDTO, CreateMetroLineStationDTO } from '../../../../api/metroLine/MetroLineInterface';
import type { GetStationDTO } from '../../../../api/station/StationInterface';

const { Title } = Typography;
const { Option } = Select;

interface MetroLineStationForm {
  id: string;
  stationId: string;
  stationName: string;
  distanceFromStart: number;
  stationOrder: number;
}

const CreateMetroLine: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<GetStationDTO[]>([]);
  const [metroLineStations, setMetroLineStations] = useState<MetroLineStationForm[]>([]);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await StationApi.getAllStations();
      
      if (response.isSuccess && response.result) {
        setStations(response.result);
      } else {
        message.error(response.message || 'Không thể tải danh sách trạm');
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      message.error('Có lỗi xảy ra khi tải danh sách trạm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStation = () => {
    if (!selectedStation) {
      message.warning('Vui lòng chọn trạm');
      return;
    }

    if (metroLineStations.length >= 2) {
      message.warning('Chỉ có thể thêm tối đa 2 trạm cho tuyến Metro');
      return;
    }

    const station = stations.find(s => s.id === selectedStation);
    if (!station) return;

    const newStation: MetroLineStationForm = {
      id: Math.random().toString(36).substr(2, 9), // Temporary ID for frontend
      stationId: station.id,
      stationName: station.name,
      distanceFromStart: metroLineStations.length === 0 ? 0 : 1, // First station at 0km, second at 1km by default
      stationOrder: metroLineStations.length + 1,
    };

    setMetroLineStations([...metroLineStations, newStation]);
    setSelectedStation(null);
  };

  const handleRemoveStation = (id: string) => {
    const newStations = metroLineStations
      .filter(station => station.id !== id)
      .map((station, index) => ({
        ...station,
        stationOrder: index + 1,
      }));
    setMetroLineStations(newStations);
  };

  const handleMoveStation = (id: string, direction: 'up' | 'down') => {
    const index = metroLineStations.findIndex(station => station.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === metroLineStations.length - 1)
    ) {
      return;
    }

    const newStations = [...metroLineStations];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newStations[index], newStations[newIndex]] = [newStations[newIndex], newStations[index]];

    // Update station orders
    const updatedStations = newStations.map((station, idx) => ({
      ...station,
      stationOrder: idx + 1,
    }));

    setMetroLineStations(updatedStations);
  };

  const handleSubmit = async (values: any) => {
    if (metroLineStations.length !== 2) {
      message.error('Tuyến Metro phải có đúng 2 trạm');
      return;
    }

    try {
      setLoading(true);
      const metroLineData: CreateMetroLineDTO = {
        metroLineNumber: values.metroLineNumber,
        metroName: values.metroName,
        startStationId: metroLineStations[0].stationId,
        endStationId: metroLineStations[metroLineStations.length - 1].stationId,
      };

      const response = await MetroLineApi.createMetroLine(metroLineData);

      if (response.isSuccess && response.result) {
        // Create metro line stations for both stations
        const metroLineId = response.result.id;
        
        // Create first station (order 1)
        const firstStationData: CreateMetroLineStationDTO = {
          metroLineId: metroLineId,
          stationId: metroLineStations[0].stationId,
          distanceFromStart: 0, // Starting point
          stationOder: 1,
        };

        // Create second station (order 2)
        const secondStationData: CreateMetroLineStationDTO = {
          metroLineId: metroLineId,
          stationId: metroLineStations[1].stationId,
          distanceFromStart: metroLineStations[1].distanceFromStart,
          stationOder: 2,
        };

        // Create both metro line stations
        const firstStationResponse = await MetroLineStationApi.createMetroLineStation(firstStationData);
        const secondStationResponse = await MetroLineStationApi.createMetroLineStation(secondStationData);

        if (firstStationResponse.isSuccess && secondStationResponse.isSuccess) {
          message.success('Tạo tuyến Metro và thêm trạm thành công');
          navigate('/admin/metro-line');
        } else {
          message.warning('Tạo tuyến Metro thành công nhưng có lỗi khi thêm trạm');
          navigate('/admin/metro-line');
        }
      } else {
        message.error(response.message || 'Không thể tạo tuyến Metro');
      }
    } catch (error) {
      console.error('Error creating metro line:', error);
      message.error('Có lỗi xảy ra khi tạo tuyến Metro');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<MetroLineStationForm> = [
    {
      title: 'Thứ Tự',
      dataIndex: 'stationOrder',
      key: 'stationOrder',
      width: 80,
    },
    {
      title: 'Tên Trạm',
      dataIndex: 'stationName',
      key: 'stationName',
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            icon={<ArrowUpOutlined />}
            disabled={record.stationOrder === 1}
            onClick={() => handleMoveStation(record.id, 'up')}
            title="Di chuyển lên"
          />
          <Button
            icon={<ArrowDownOutlined />}
            disabled={record.stationOrder === metroLineStations.length}
            onClick={() => handleMoveStation(record.id, 'down')}
            title="Di chuyển xuống"
          />
          <Popconfirm
            title="Xóa trạm"
            description="Bạn có chắc chắn muốn xóa trạm này?"
            onConfirm={() => handleRemoveStation(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger icon={<DeleteOutlined />} title="Xóa trạm" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space>
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/metro-line')}
        >
          Quay lại
        </Button>
        <Title level={2} style={{ margin: 0 }}>Tạo Tuyến Metro Mới</Title>
      </Space>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ metroName: '' }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="metroLineNumber"
                label="Số Tuyến"
                rules={[
                  { required: true, message: 'Vui lòng nhập số tuyến' },
                  { type: 'number', min: 1, message: 'Số tuyến phải lớn hơn 0' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="Nhập số tuyến"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="metroName"
                label="Tên Tuyến"
              >
                <Input placeholder="Nhập tên tuyến (không bắt buộc)" />
              </Form.Item>
            </Col>
          </Row>

          <Card
            title="Danh Sách Trạm (Tối đa 2 trạm)"
            extra={
              <Space>
                <Select
                  style={{ width: 200 }}
                  placeholder="Chọn trạm"
                  value={selectedStation}
                  onChange={setSelectedStation}
                  allowClear
                  disabled={metroLineStations.length >= 2}
                >
                  {stations
                    .filter(station => !metroLineStations.some(ms => ms.stationId === station.id))
                    .map(station => (
                      <Option key={station.id} value={station.id}>
                        {station.name}
                      </Option>
                    ))}
                </Select>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddStation}
                  disabled={!selectedStation || metroLineStations.length >= 2}
                >
                  Thêm Trạm
                </Button>
              </Space>
            }
          >
            {metroLineStations.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <b>Trạm bắt đầu:</b> {metroLineStations[0].stationName} <br />
                <b>Trạm kết thúc:</b> {metroLineStations[metroLineStations.length - 1].stationName}
              </div>
            )}
            <Table
              columns={columns}
              dataSource={metroLineStations}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{
                emptyText: 'Chưa có trạm nào được thêm',
              }}
            />
          </Card>

          {metroLineStations.length === 2 && (
            <Card title="Cấu hình khoảng cách" style={{ marginTop: 16 }}>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label={`Khoảng cách từ ${metroLineStations[0]?.stationName} đến ${metroLineStations[1]?.stationName} (km)`}
                  >
                    <InputNumber
                      min={0.1}
                      step={0.1}
                      style={{ width: '100%' }}
                      placeholder="Nhập khoảng cách"
                      defaultValue={1}
                      onChange={(value) => {
                        if (value !== null) {
                          const updatedStations = [...metroLineStations];
                          updatedStations[1].distanceFromStart = value;
                          setMetroLineStations(updatedStations);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => navigate('/admin/metro-line')}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                disabled={metroLineStations.length !== 2}
              >
                Tạo Tuyến Metro
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default CreateMetroLine;
