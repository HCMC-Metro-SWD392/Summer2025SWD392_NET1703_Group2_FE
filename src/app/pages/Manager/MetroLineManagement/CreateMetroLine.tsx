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
import { DeleteOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Option } = Select;

interface Station {
  id: string;
  name: string;
  address: string;
}

interface MetroLineStation {
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
  const [stations, setStations] = useState<Station[]>([]);
  const [metroLineStations, setMetroLineStations] = useState<MetroLineStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations');
      if (!response.ok) {
        throw new Error('Failed to fetch stations');
      }
      const data = await response.json();
      setStations(data);
    } catch (error) {
      message.error('Failed to fetch stations');
    }
  };

  const handleAddStation = () => {
    if (!selectedStation) {
      message.warning('Please select a station first');
      return;
    }

    const station = stations.find(s => s.id === selectedStation);
    if (!station) return;

    const newStation: MetroLineStation = {
      id: Math.random().toString(36).substr(2, 9), // Temporary ID for frontend
      stationId: station.id,
      stationName: station.name,
      distanceFromStart: 0,
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
    if (metroLineStations.length < 2) {
      message.error('A metro line must have at least 2 stations');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/metro-lines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metroLineNumber: values.metroLineNumber,
          metroName: values.metroName,
          startStationId: metroLineStations[0].stationId,
          endStationId: metroLineStations[metroLineStations.length - 1].stationId,
          metroLineStations: metroLineStations.map(station => ({
            stationId: station.stationId,
            distanceFromStart: station.distanceFromStart,
            stationOrder: station.stationOrder,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create metro line');
      }

      message.success('Metro line created successfully');
      navigate('/manager/metro-lines');
    } catch (error) {
      message.error('Failed to create metro line');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<MetroLineStation> = [
    {
      title: 'Order',
      dataIndex: 'stationOrder',
      key: 'stationOrder',
      width: 80,
    },
    {
      title: 'Station Name',
      dataIndex: 'stationName',
      key: 'stationName',
    },
    {
      title: 'Distance from Start (km)',
      dataIndex: 'distanceFromStart',
      key: 'distanceFromStart',
      render: (_, record) => (
        <InputNumber
          min={0}
          step={0.1}
          value={record.distanceFromStart}
          onChange={(value) => {
            const newStations = metroLineStations.map(station =>
              station.id === record.id
                ? { ...station, distanceFromStart: value || 0 }
                : station
            );
            setMetroLineStations(newStations);
          }}
          style={{ width: '120px' }}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            icon={<ArrowUpOutlined />}
            disabled={record.stationOrder === 1}
            onClick={() => handleMoveStation(record.id, 'up')}
          />
          <Button
            icon={<ArrowDownOutlined />}
            disabled={record.stationOrder === metroLineStations.length}
            onClick={() => handleMoveStation(record.id, 'down')}
          />
          <Popconfirm
            title="Remove Station"
            description="Are you sure you want to remove this station?"
            onConfirm={() => handleRemoveStation(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space>
        <Button onClick={() => navigate('/manager/metro-lines')}>Back to Metro Lines</Button>
        <Title level={2} style={{ margin: 0 }}>Create Metro Line</Title>
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
                label="Metro Line Number"
                rules={[{ required: true, message: 'Please enter metro line number' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="Enter metro line number"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="metroName"
                label="Metro Line Name"
              >
                <Input placeholder="Enter metro line name (optional)" />
              </Form.Item>
            </Col>
          </Row>

          <Card
            title="Stations"
            extra={
              <Space>
                <Select
                  style={{ width: 200 }}
                  placeholder="Select a station"
                  value={selectedStation}
                  onChange={setSelectedStation}
                  allowClear
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
                  disabled={!selectedStation}
                >
                  Add Station
                </Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={metroLineStations}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>

          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => navigate('/manager/metro-lines')}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Metro Line
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default CreateMetroLine;
