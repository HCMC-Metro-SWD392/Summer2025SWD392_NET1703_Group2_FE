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
  message,
  Tooltip,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { StationApi } from '../../../../api/station/StationApi';
import type { Station, ResponseDTO } from '../../../../api/station/StationInterface';

const { Title } = Typography;
const { Search } = Input;

// Station status types
type StationStatus = 'Active' | 'Partially Active' | 'Inactive';
type StatusConfig = {
  status: StationStatus;
  color: string;
  label: string;
};

const STATION_STATUS_CONFIG: Record<StationStatus, StatusConfig> = {
  'Active': {
    status: 'Active',
    color: 'success',
    label: 'Hoạt Động'
  },
  'Partially Active': {
    status: 'Partially Active',
    color: 'warning',
    label: 'Hoạt Động Một Phần'
  },
  'Inactive': {
    status: 'Inactive',
    color: 'default',
    label: 'Không Hoạt Động'
  }
};

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

  const getStationStatus = (station: Station): StatusConfig => {
    const hasActiveRoutes = (station.ticketRoutesAsFirstStation?.length || 0) > 0 || 
                          (station.ticketRoutesAsLastStation?.length || 0) > 0;
    const hasActiveSchedules = (station.strainSchedules?.length || 0) > 0;
    const isMetroLineStation = (station.metroLineStations?.length || 0) > 0;

    if (hasActiveRoutes && hasActiveSchedules) {
      return STATION_STATUS_CONFIG['Active'];
    } else if (isMetroLineStation) {
      return STATION_STATUS_CONFIG['Partially Active'];
    } else {
      return STATION_STATUS_CONFIG['Inactive'];
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleRefresh = () => {
    fetchStations();
    setSearchText('');
  };

  const columns: ColumnsType<Station> = [
    {
      title: 'Tên Trạm',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) => {
        const searchValue = (value as string).toLowerCase();
        return (
          record.name.toLowerCase().includes(searchValue) ||
          (record.address?.toLowerCase() || '').includes(searchValue) ||
          (record.description?.toLowerCase() || '').includes(searchValue)
        );
      },
    },
    {
      title: 'Địa Chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (address: string | undefined) => address || 'N/A',
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string | undefined) => description || 'N/A',
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      render: (_, record) => {
        const statusConfig = getStationStatus(record);
        return <Tag color={statusConfig.color}>{statusConfig.label}</Tag>;
      },
      filters: Object.values(STATION_STATUS_CONFIG).map(config => ({
        text: config.label,
        value: config.status
      })),
      onFilter: (value, record) => getStationStatus(record).status === value,
    },
    {
      title: 'Tuyến Vé',
      key: 'routes',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tooltip title="Tuyến vé bắt đầu từ trạm này">
            <Tag color="blue">Đi: {record.ticketRoutesAsFirstStation?.length || 0}</Tag>
          </Tooltip>
          <Tooltip title="Tuyến vé kết thúc tại trạm này">
            <Tag color="green">Đến: {record.ticketRoutesAsLastStation?.length || 0}</Tag>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Tuyến Metro',
      key: 'metroLines',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tooltip title="Tuyến metro bắt đầu từ trạm này">
            <Tag color="purple">Đi: {record.startStations?.length || 0}</Tag>
          </Tooltip>
          <Tooltip title="Tuyến metro kết thúc tại trạm này">
            <Tag color="orange">Đến: {record.endStations?.length || 0}</Tag>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem Chi Tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/manager/station/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh Sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/manager/station/${record.id}/edit`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2} style={{ margin: 0 }}>Quản Lý Trạm Metro</Title>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Tìm kiếm trạm..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Tooltip title="Làm mới">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/manager/station/create')}
            >
              Thêm Trạm
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
            showTotal: (total) => `Tổng số ${total} trạm`,
            locale: {
              items_per_page: 'trạm / trang',
              jump_to: 'Đi đến',
              jump_to_confirm: 'Xác nhận',
              page: 'Trang',
            }
          }}
          locale={{
            emptyText: 'Không có dữ liệu',
            triggerDesc: 'Sắp xếp giảm dần',
            triggerAsc: 'Sắp xếp tăng dần',
            cancelSort: 'Hủy sắp xếp',
          }}
        />
      </Card>
    </Space>
  );
};

export default StationList;
