import {
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Row,
  Space,
  Table,
  Tooltip,
  Typography,
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StationApi } from '../../../../api/station/StationApi';
import type { Station } from '../../../../api/station/StationInterface';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

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

const TOTAL_STATIONS = 101;

const StationList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null);

  // Số lượng mặc định mỗi trang
  const DEFAULT_PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    fetchStations();
  }, [isActiveFilter, page, pageSize]);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await StationApi.getAllStations({
        isActive: isActiveFilter,
        pageNumber: page,
        pageSize: pageSize
      });
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

  const handleFilterChange = (value: boolean | null | string) => {
    if (value === null) setIsActiveFilter(null);
    else if (value === true || value === 'true') setIsActiveFilter(true);
    else setIsActiveFilter(false);
  };

  const columns: ColumnsType<Station> = [
    {
      title: 'Tên Trạm',
      dataIndex: 'name',
      key: 'name',
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
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type='primary'
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/station/${record.id}`)}
          >
            Xem Chi Tiết
          </Button>
          <Button
            type='primary'
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/station/${record.id}/edit`)}
          >
            Chỉnh Sửa
          </Button>
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
              onClick={() => navigate('/admin/create-station')}
            >
              Thêm Trạm
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Typography.Text strong>Lọc theo trạng thái:</Typography.Text>
          <Select
            style={{ width: 200 }}
            value={isActiveFilter}
            onChange={handleFilterChange}
            placeholder="Chọn trạng thái"
            allowClear
          >
            <Option value={null}>Tất cả</Option>
            <Option value={true}>Đang hoạt động</Option>
            <Option value={false}>Ngừng hoạt động</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={stations}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: pageSize,
            current: page,
            total: TOTAL_STATIONS,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
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
