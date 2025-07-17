import React, { useState, useEffect } from 'react';
import { Typography, Table, Button, message, Tag, Space, Input, Select, Card, Row, Col } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../../settings/axiosInstance';
import { NewsStatus } from './CreateNews';
import ViewSpecificNews from './ViewSpecificNews';
import UpdateNews from './UpdateNews';

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
  status?: number | 'all';
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: string;
}

const NewsListPageForStaff: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterParams>({
    filterOn: '',
    filterQuery: '',
    status: 'all',
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  
  // State for View News Modal
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  
  // State for Update News Modal
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedUpdateNewsId, setSelectedUpdateNewsId] = useState<string | null>(null);
  
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
        isMyNews: true, // Chỉ lấy news của staff hiện tại
      };

      if (filters.filterOn && filters.filterQuery) {
        params.filterOn = filters.filterOn;
        params.filterQuery = filters.filterQuery;
      }

      if (filters.status !== 'all' && filters.status !== undefined && filters.status !== null) {
        params.status = filters.status;
      }

      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
      }
      if (filters.sortOrder) {
        params.sortOrder = filters.sortOrder;
      }

      const response = await axiosInstance.get<NewsListResponse>('/api/News/get-all-news-for-staff', {
        params
      });
      
      if (response.data?.isSuccess) {
        let newsItems = response.data.result || [];
        
        // Sort locally if needed (in case API doesn't support sorting)
        if (filters.sortBy === 'createdAt' && filters.sortOrder === 'desc') {
          newsItems = newsItems.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA; // Descending order (newest first)
          });
        }
        
        setNewsData(newsItems);
        setTotal(newsItems.length);
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
      status: 'all',
      pageNumber: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const handleViewNews = (newsId: string) => {
    setSelectedNewsId(newsId);
    setViewModalVisible(true);
  };

  const handleCloseViewModal = () => {
    setViewModalVisible(false);
    setSelectedNewsId(null);
  };

  const handleUpdateNews = (newsId: string) => {
    setSelectedUpdateNewsId(newsId);
    setUpdateModalVisible(true);
  };

  const handleCloseUpdateModal = () => {
    setUpdateModalVisible(false);
    setSelectedUpdateNewsId(null);
  };

  const handleUpdateSuccess = () => {
    fetchNewsList();
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: '30%',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: '12%',
    },
    {
      title: 'Tóm tắt',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      width: '25%',
      render: (text: string) => text || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: any) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '11%',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: '11%',
      render: (date: string) => {
        if (!date || date === '0001-01-01T00:00:00') return '-';
        return formatDate(date);
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '15%',
      render: (record: NewsItem) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            title="Xem chi tiết"
            onClick={() => handleViewNews(record.id)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            title="Chỉnh sửa"
            onClick={() => handleUpdateNews(record.id)}
          />
        </Space>
      ),
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="mb-0">
          Tin Tức Của Tôi
        </Title>
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
            >
              <Option value="all">Tất cả</Option>
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
          pagination={{
            current: filters.pageNumber,
            pageSize: filters.pageSize,
            total: total,
            showSizeChanger: false, // Controlled by our custom select
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} trong tổng số ${total} tin tức của bạn`,
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

      {/* View News Modal */}
      <ViewSpecificNews
        newsId={selectedNewsId}
        visible={viewModalVisible}
        onClose={handleCloseViewModal}
      />

      {/* Update News Modal */}
      <UpdateNews
        newsId={selectedUpdateNewsId}
        visible={updateModalVisible}
        onClose={handleCloseUpdateModal}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default NewsListPageForStaff; 