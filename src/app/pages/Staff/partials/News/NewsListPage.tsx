import React, { useState, useEffect } from 'react';
import { Typography, Table, Button, message, Tag, Space, Input, Select, Card, Row, Col } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../../settings/axiosInstance';
import { NewsStatus } from './CreateNews';
import ViewSpecificNews from './ViewSpecificNews';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  category: string;
  staffName?: string;
  createdAt: string;
  updatedAt: string;
  status: NewsStatus;
}

interface NewsListResponse {
  result: NewsItem[];
  message: string;
  isSuccess: boolean;
  statusCode: number;
}

interface FilterParams {
  filterOn: string;
  filterQuery: string;
  status?: number;
  pageNumber: number;
  pageSize: number;
}

const NewsListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterParams>({
    filterOn: '',
    filterQuery: '',
    status: undefined,
    pageNumber: 1,
    pageSize: 10,
  });
  
  // State for View News Modal
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchNewsList();
  }, [filters]);

  const fetchNewsList = async () => {
    setLoading(true);
    try {
      const params: any = {
        pageNumber: filters.pageNumber,
        pageSize: filters.pageSize,
      };

      if (filters.filterOn && filters.filterQuery) {
        params.filterOn = filters.filterOn;
        params.filterQuery = filters.filterQuery;
      }

      if (filters.status !== undefined && filters.status !== null) {
        params.status = filters.status;
      }

      const response = await axiosInstance.get<NewsListResponse>('/api/News/get-all-news-for-staff', {
        params
      });
      
      if (response.data?.isSuccess) {
        setNewsData(response.data.result || []);
        setTotal(response.data.result?.length || 0); // API might need to return total count separately
        if (response.data.message) {
          console.log(response.data.message);
        }
      } else {
        message.error(response.data?.message || 'Không thể tải danh sách tin tức');
        setNewsData([]);
      }
    } catch (error: any) {
      console.error('Error fetching news:', error);
      message.error(error?.response?.data?.message || 'Không thể tải danh sách tin tức');
      setNewsData([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: NewsStatus) => {
    const statusConfig = {
      [NewsStatus.Pending]: { color: 'orange', text: 'Đang chờ duyệt' },
      [NewsStatus.Published]: { color: 'green', text: 'Đã xuất bản' },
      [NewsStatus.Rejected]: { color: 'red', text: 'Đã từ chối' },
      [NewsStatus.Updated]: { color: 'blue', text: 'Đã cập nhật' },
    };
    
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const handleFilterChange = (key: keyof FilterParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      pageNumber: 1, // Reset to first page when filtering
    }));
  };

  const handleSearch = (value: string) => {
    if (filters.filterOn) {
      handleFilterChange('filterQuery', value);
    } else {
      message.warning('Vui lòng chọn trường để tìm kiếm');
    }
  };

  const handleReset = () => {
    setFilters({
      filterOn: '',
      filterQuery: '',
      status: undefined,
      pageNumber: 1,
      pageSize: 10,
    });
  };

  const handleViewNews = (newsId: string) => {
    console.log('[DEBUG] Opening news detail modal for ID:', newsId);
    setSelectedNewsId(newsId);
    setViewModalVisible(true);
  };

  const handleCloseViewModal = () => {
    console.log('[DEBUG] Closing news detail modal');
    setViewModalVisible(false);
    setSelectedNewsId(null);
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: 'Tóm tắt',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      width: 200,
      render: (text: string) => text || '-',
    },
    {
      title: 'Người tạo',
      dataIndex: 'staffName',
      key: 'staffName',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: NewsStatus) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      render: (date: string) => {
        if (!date || date === '0001-01-01T00:00:00') return '-';
        return formatDate(date);
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 160,
      fixed: 'right' as const,
      render: (record: NewsItem) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            title="Xem chi tiết"
            onClick={() => {
              message.info(`Xem chi tiết tin tức: ${record.title}`);
            }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            title="Chỉnh sửa"
            onClick={() => {
              message.info(`Chỉnh sửa tin tức: ${record.title}`);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            title="Xóa"
            onClick={() => {
              message.info(`Xóa tin tức: ${record.title}`);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="mb-0">Danh Sách Tin Tức</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/staff/create-news')}
        >
          Tạo Tin Tức Mới
        </Button>
      </div>

      {/* Filter Section */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Chọn trường tìm kiếm"
              value={filters.filterOn || undefined}
              onChange={(value) => handleFilterChange('filterOn', value)}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="title">Tiêu đề</Option>
              <Option value="content">Nội dung</Option>
              <Option value="category">Danh mục</Option>
              <Option value="summary">Tóm tắt</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Search
              placeholder="Nhập từ khóa tìm kiếm"
              value={filters.filterQuery}
              onChange={(e) => handleFilterChange('filterQuery', e.target.value)}
              onSearch={handleSearch}
              disabled={!filters.filterOn}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Trạng thái"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value={NewsStatus.Pending}>Đang chờ duyệt</Option>
              <Option value={NewsStatus.Published}>Đã xuất bản</Option>
              <Option value={NewsStatus.Rejected}>Đã từ chối</Option>
              <Option value={NewsStatus.Updated}>Đã cập nhật</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.pageSize}
              onChange={(value) => handleFilterChange('pageSize', value)}
              style={{ width: '100%' }}
            >
              <Option value={5}>5 / trang</Option>
              <Option value={10}>10 / trang</Option>
              <Option value={20}>20 / trang</Option>
              <Option value={50}>50 / trang</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchNewsList}
                loading={loading}
              >
                Tải lại
              </Button>
              <Button onClick={handleReset}>
                Đặt lại
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md">
        <Table
          columns={columns}
          dataSource={newsData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: filters.pageNumber,
            pageSize: filters.pageSize,
            total: total,
            showSizeChanger: false, // Controlled by our custom select
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} trong tổng số ${total} tin tức`,
            onChange: (page, pageSize) => {
              setFilters(prev => ({
                ...prev,
                pageNumber: page,
                pageSize: pageSize || prev.pageSize,
              }));
            },
          }}
        />
      </div>
    </div>
  );
};

export default NewsListPage; 