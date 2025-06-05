import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Typography,
  Tag,
  Popconfirm,
  message,
  Tooltip,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Search } = Input;

interface Station {
  id: string;
  name: string;
  address: string;
  description: string;
  ticketRoutesAsFirstStation: any[];
  ticketRoutesAsLastStation: any[];
  checkInProcesses: any[];
  checkOutProcesses: any[];
  startStations: any[];
  endStations: any[];
  strainSchedules: any[];
  metroLineStations: any[];
}

const StationList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stations');
      if (!response.ok) {
        throw new Error('Failed to fetch stations');
      }
      const data = await response.json();
      setStations(data);
    } catch (error) {
      message.error('Failed to fetch stations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/stations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete station');
      }

      message.success('Station deleted successfully');
      fetchStations(); // Refresh the list
    } catch (error) {
      message.error('Failed to delete station');
    }
  };

  const getStationStatus = (station: Station) => {
    const hasActiveRoutes = station.ticketRoutesAsFirstStation.length > 0 || 
                          station.ticketRoutesAsLastStation.length > 0;
    const hasActiveSchedules = station.strainSchedules.length > 0;
    const isMetroLineStation = station.metroLineStations.length > 0;

    if (hasActiveRoutes && hasActiveSchedules) {
      return { status: 'Active', color: 'success' };
    } else if (isMetroLineStation) {
      return { status: 'Partially Active', color: 'warning' };
    } else {
      return { status: 'Inactive', color: 'default' };
    }
  };

  const columns: ColumnsType<Station> = [
    {
      title: 'Station Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.name.toLowerCase().includes((value as string).toLowerCase()) ||
        record.address.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const { status, color } = getStationStatus(record);
        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Partially Active', value: 'Partially Active' },
        { text: 'Inactive', value: 'Inactive' },
      ],
      onFilter: (value, record) => getStationStatus(record).status === value,
    },
    {
      title: 'Routes',
      key: 'routes',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tooltip title="Routes starting from this station">
            <Tag color="blue">Start: {record.ticketRoutesAsFirstStation.length}</Tag>
          </Tooltip>
          <Tooltip title="Routes ending at this station">
            <Tag color="green">End: {record.ticketRoutesAsLastStation.length}</Tag>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Metro Lines',
      key: 'metroLines',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tooltip title="Lines starting from this station">
            <Tag color="purple">Start: {record.startStations.length}</Tag>
          </Tooltip>
          <Tooltip title="Lines ending at this station">
            <Tag color="orange">End: {record.endStations.length}</Tag>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/manager/stations/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit Station">
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/manager/stations/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Delete Station">
            <Popconfirm
              title="Delete Station"
              description="Are you sure you want to delete this station? This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={getStationStatus(record).status === 'Active'}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2} style={{ margin: 0 }}>Stations</Title>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Search stations..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={setSearchText}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/manager/stations/create')}
            >
              Add Station
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={stations}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} stations`,
          }}
        />
      </Card>
    </Space>
  );
};

export default StationList;
