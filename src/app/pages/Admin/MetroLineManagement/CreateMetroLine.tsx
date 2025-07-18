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
  TimePicker,
} from 'antd';
import { DeleteOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MetroLineApi } from '../../../../api/metroLine/MetroLineApi';
import { StationApi } from '../../../../api/station/StationApi';
import { MetroLineStationApi } from '../../../../api/metroLine/MetroLineStationApi';
import type { CreateMetroLineDTO, CreateMetroLineStationDTO } from '../../../../api/metroLine/MetroLineInterface';
import type { GetStationDTO } from '../../../../api/station/StationInterface';
import dayjs from 'dayjs';

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
  const [endStationOrder, setEndStationOrder] = useState<number>(2); // Default order for end station
  const [totalStations, setTotalStations] = useState<number>(2); // Default to 2

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

    if (metroLineStations.length >= totalStations) {
      message.warning(`Chỉ có thể thêm tối đa ${totalStations} trạm cho tuyến Metro`);
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
    if (metroLineStations.length !== totalStations) {
      message.error(`Tuyến Metro phải có đúng ${totalStations} trạm`);
      return;
    }

    // Validation: distances must be unique and strictly increasing
    const distances = metroLineStations.map(s => s.distanceFromStart);
    const restDistances = distances.slice(1); // Ignore the first station (always 0)

    // Check for duplicates
    const hasDuplicates = new Set(restDistances).size !== restDistances.length;
    if (hasDuplicates) {
      message.error('Khoảng cách từ trạm đầu của các trạm phải khác nhau');
      return;
    }

    // Check for strictly increasing
    let isStrictlyIncreasing = true;
    for (let i = 1; i < distances.length; i++) {
      if (distances[i] <= distances[i - 1]) {
        isStrictlyIncreasing = false;
        break;
      }
    }
    if (!isStrictlyIncreasing) {
      message.error('Khoảng cách từ trạm đầu phải tăng dần theo thứ tự trạm');
      return;
    }

    try {
      setLoading(true);
      const startStation = metroLineStations[0];
      const endStation = metroLineStations[metroLineStations.length - 1];
      const metroLineData: CreateMetroLineDTO = {
        metroName: values.metroName,
        startStationId: startStation.stationId,
        endStationId: endStation.stationId,
        startTime: values.startTime.format('HH:mm:ss'),
        endTime: values.endTime.format('HH:mm:ss'),
      };

      const response = await MetroLineApi.createMetroLine(metroLineData);
      console.log('MetroLine creation response:', response);

      if (response.isSuccess && response.result) {
        console.log('About to create stations...');
        const metroLineId = response.result.id;
        // Create all metro line stations
        for (let i = 0; i < metroLineStations.length; i++) {
          const station = metroLineStations[i];
          const stationData: CreateMetroLineStationDTO = {
            metroLineId: metroLineId,
            stationId: station.stationId,
            distanceFromStart: i === 0 ? 0 : station.distanceFromStart,
            stationOder: i + 1,
          };
          const stationResponse = await MetroLineStationApi.createMetroLineStation(stationData);
          if (!stationResponse.isSuccess) {
            message.warning('Tạo tuyến Metro thành công nhưng có lỗi khi thêm trạm');
            navigate('/admin/metro-line');
            setLoading(false);
            return;
          }
        }
        message.success('Tạo tuyến Metro và thêm trạm thành công');
        navigate('/admin/metro-line');
      } else {
        console.log('MetroLine creation failed or response invalid');
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
      title: 'Khoảng cách từ trạm đầu (km)',
      key: 'distanceFromStart',
      render: (_, record, idx) =>
        idx === 0 ? (
          <span>0</span>
        ) : (
          <InputNumber
            min={0.1}
            step={0.1}
            value={record.distanceFromStart}
            onChange={value => {
              if (value !== null) {
                const updatedStations = [...metroLineStations];
                updatedStations[idx].distanceFromStart = value;
                setMetroLineStations(updatedStations);
              }
            }}
          />
        ),
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
                name="metroName"
                label="Tên Tuyến"
              >
                <Input placeholder="Nhập tên tuyến" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="startTime"
                label="Giờ bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu' }]}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="endTime"
                label="Giờ kết thúc"
                rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc' }]}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Số lượng trạm trên tuyến Metro"
            style={{ maxWidth: 300 }}
          >
            <InputNumber
              min={2}
              max={100}
              value={totalStations}
              onChange={value => {
                setTotalStations(value || 2);
                if ((value || 2) < metroLineStations.length) {
                  setMetroLineStations(metroLineStations.slice(0, value || 2));
                }
              }}
            />
          </Form.Item>

          <Card
            title={`Danh Sách Trạm (Tối đa ${totalStations} trạm)`}
            extra={
              <Space>
                <Select
                  style={{ width: 200 }}
                  placeholder="Chọn trạm"
                  value={selectedStation}
                  onChange={setSelectedStation}
                  allowClear
                  disabled={metroLineStations.length >= totalStations}
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
                  disabled={!selectedStation || metroLineStations.length >= totalStations}
                >
                  Thêm Trạm
                </Button>
              </Space>
            }
          >
            {metroLineStations.length === totalStations && (
              <div style={{ marginBottom: 16 }}>
                <b>Trạm bắt đầu:</b> {metroLineStations[0].stationName} (Thứ tự: 1 )<br />
                <b>Trạm kết thúc:</b> {metroLineStations[metroLineStations.length - 1].stationName} (Thứ tự: {totalStations})
              </div>
            )}
            <Table
              columns={columns}
              dataSource={metroLineStations.map((station, idx) => ({
                ...station,
                stationOrder: idx + 1
              }))}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{
                emptyText: 'Chưa có trạm nào được thêm',
              }}
            />
          </Card>

          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => navigate('/admin/metro-line')}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                disabled={metroLineStations.length !== totalStations}
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
