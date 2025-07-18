import React, { useState, useEffect } from 'react';
import { Typography, Table, Button, message, Tag, Space, Input, Select, Card, Row, Col, Tooltip, Avatar } from 'antd';
import { EyeOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, UserOutlined, CloseOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../settings/axiosInstance';
import { NewsStatus } from '../../Staff/partials/News/CreateNews';
import ViewSpecificNews from '../../Staff/partials/News/ViewSpecificNews';
import UpdateNewsStatus from './UpdateNewsStatus';
import DeleteNews from './DeleteNews';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface StaffInfo {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  category: string;
  staffName?: string;
  staffId?: string;
  staff?: StaffInfo; // Thêm thông tin chi tiết về staff
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

const NewsListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [enrichingStaffInfo, setEnrichingStaffInfo] = useState(false);
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
  
  // State for Update Status Modal
  const [updateStatusModalVisible, setUpdateStatusModalVisible] = useState(false);
  const [selectedNewsForStatus, setSelectedNewsForStatus] = useState<string | null>(null);
  
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

      if (filters.status !== 'all' && filters.status !== undefined && filters.status !== null) {
        params.status = filters.status;
      }

      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
      }
      if (filters.sortOrder) {
        params.sortOrder = filters.sortOrder;
      }

      const response = await axiosInstance.get<NewsListResponse>('/api/News/get-all-news-for-manager', {
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
        
        // Set dữ liệu ban đầu trước
        setNewsData(newsItems);
        setTotal(newsItems.length);
        
        // Enrich data với thông tin staff chi tiết nếu thiếu (chạy background)
        setEnrichingStaffInfo(true);
        try {
          const enrichedNewsItems = await enrichNewsWithStaffInfo(newsItems);
          setNewsData(enrichedNewsItems);
        } catch (error) {
          console.warn('Error enriching staff info:', error);
        } finally {
          setEnrichingStaffInfo(false);
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

  // Function để lấy thông tin staff chi tiết cho những news thiếu thông tin
  const enrichNewsWithStaffInfo = async (newsItems: NewsItem[]): Promise<NewsItem[]> => {
    // Lọc ra những items cần fetch thông tin staff
    const itemsNeedEnrich = newsItems.filter(item => 
      !item.staffName || 
      item.staffName.trim() === '' || 
      item.staffName === 'Không rõ' ||
      item.staffName.toLowerCase().includes('unknown')
    );

    // console.log(`[DEBUG] Found ${itemsNeedEnrich.length} items needing staff info enrichment`);

    // Nếu không có items nào cần enrich, return ngay
    if (itemsNeedEnrich.length === 0) {
      return newsItems;
    }

    // Giới hạn số lượng concurrent requests để tránh quá tải
    const BATCH_SIZE = 3;
    const enrichedData: { [key: string]: string } = {};

    for (let i = 0; i < itemsNeedEnrich.length; i += BATCH_SIZE) {
      const batch = itemsNeedEnrich.slice(i, i + BATCH_SIZE);
      
      await Promise.all(
        batch.map(async (item) => {
          try {
            // console.log(`[DEBUG] Fetching staff info for news: ${item.id}`);
            const detailResponse = await axiosInstance.get(`/api/News/get-news-by-id/${item.id}`);
            
            if (detailResponse.data?.isSuccess && detailResponse.data.result?.staffName) {
              enrichedData[item.id] = detailResponse.data.result.staffName;
              // console.log(`[DEBUG] Got staff name for ${item.id}: ${detailResponse.data.result.staffName}`);
            }
          } catch (error) {
            console.warn(`[DEBUG] Failed to get staff info for news ${item.id}:`, error);
          }
        })
      );
    }

    // Merge enriched data back to original items
    const enrichedItems = newsItems.map(item => {
      if (enrichedData[item.id]) {
        return {
          ...item,
          staffName: enrichedData[item.id]
        };
      }
      return item;
    });

    // console.log(`[DEBUG] Successfully enriched ${Object.keys(enrichedData).length} items with staff info`);
    return enrichedItems;
  };

  const getStatusTag = (status: NewsStatus, showIcon: boolean = false) => {
    const statusConfig = {
      [NewsStatus.Pending]: { 
        color: 'orange', 
        text: 'Đang chờ duyệt',
        icon: <CloseOutlined />
      },
      [NewsStatus.Published]: { 
        color: 'green', 
        text: 'Đã xuất bản',
        icon: <CloseOutlined />
      },
      [NewsStatus.Rejected]: { 
        color: 'red', 
        text: 'Đã từ chối',
        icon: <CloseOutlined />
      },
      [NewsStatus.Updated]: { 
        color: 'blue', 
        text: 'Đã cập nhật',
        icon: <CloseOutlined />
      },
    };
    
    const config = statusConfig[status];
    return (
      <Tag 
        color={config.color}
        icon={showIcon ? config.icon : undefined}
      >
        {config.text}
      </Tag>
    );
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

  const handleUpdateStatus = (newsId: string) => {
    setSelectedNewsForStatus(newsId);
    setUpdateStatusModalVisible(true);
  };

  const handleCloseUpdateStatusModal = () => {
    setUpdateStatusModalVisible(false);
    setSelectedNewsForStatus(null);
  };

  const handleUpdateStatusSuccess = (newsId: string, newStatus: NewsStatus) => {
    // Cập nhật trạng thái tin tức trong state
    setNewsData(prevData => 
      prevData.map(item => 
        item.id === newsId 
          ? { 
              ...item, 
              status: newStatus,
              updatedAt: new Date().toISOString() // Cập nhật thời gian
            }
          : item
      )
    );
    
    // Refresh lại danh sách để có dữ liệu mới nhất
    fetchNewsList();
  };

  const handleDeleteNews = (newsId: string, title: string) => {
    DeleteNews.showConfirm({
      newsId,
      newsTitle: title,
      onDeleteSuccess: fetchNewsList,
    });
  };

  // Tính toán thống kê theo staff
  const getStaffStatistics = () => {
    const staffStats: { [key: string]: { name: string; count: number; published: number; pending: number } } = {};
    
    newsData.forEach(item => {
      const staffName = item.staffName || 'Không rõ';
      const staffId = item.staffId || item.staff?.id || 'unknown';
      
      if (!staffStats[staffId]) {
        staffStats[staffId] = {
          name: staffName,
          count: 0,
          published: 0,
          pending: 0
        };
      }
      
      staffStats[staffId].count++;
      if (item.status === NewsStatus.Published) {
        staffStats[staffId].published++;
      } else if (item.status === NewsStatus.Pending) {
        staffStats[staffId].pending++;
      }
    });
    
    return Object.entries(staffStats)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 staff
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: '25%',
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
      width: '18%',
      render: (text: string) => text || '-',
    },
    {
      title: 'Người tạo',
      dataIndex: 'staffName',
      key: 'staffName',
      width: '15%',
      ellipsis: true,
      render: (text: string, record: NewsItem) => {
        const staffName = record.staffName || text;
        const staffId = record.staffId || record.staff?.id;
        
        // Không hiển thị nếu không có thông tin staff
        if (!staffName && !staffId) {
          return (
            <Space>
              <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#d9d9d9' }} />
              <span style={{ fontStyle: 'italic', color: '#999' }}>
                {enrichingStaffInfo ? 'Đang tải...' : 'Chưa rõ'}
              </span>
            </Space>
          );
        }
        
        return (
          <Space direction="vertical" size={2}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <Tooltip title={`Tên: ${staffName || 'N/A'}${staffId ? `\nID: ${staffId}` : ''}${record.staff?.email ? `\nEmail: ${record.staff.email}` : ''}`}>
                <span style={{ fontWeight: 500 }}>{staffName || `Staff ID: ${staffId?.substring(0, 8)}...`}</span>
              </Tooltip>
            </div>
            {staffId && staffName && (
              <span style={{ fontSize: 11, color: '#666', opacity: 0.8 }}>
                ID: {staffId.substring(0, 8)}...
              </span>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: any) => getStatusTag(status, true),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '9%',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: '10%',
      render: (date: string) => {
        if (!date || date === '0001-01-01T00:00:00') return '-';
        return formatDate(date);
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '15%',
      render: (record: NewsItem) => {
        const canApprove = record.status === NewsStatus.Pending || record.status === NewsStatus.Updated;
        
        return (
          <Space size="small">
            {canApprove ? (
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                style={{ color: '#52c41a' }}
                size="small"
                title="Duyệt tin tức"
                onClick={() => handleUpdateStatus(record.id)}
              >
                Duyệt
              </Button>
            ) : (
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                title="Xem chi tiết"
                onClick={() => handleViewNews(record.id)}
              />
            )}
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Xóa"
              onClick={() => handleDeleteNews(record.id, record.title)}
            />
          </Space>
        );
      },
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Title level={3} className="mb-0">
            Quản Lý Tin Tức
          </Title>
          {enrichingStaffInfo && (
            <Tag color="processing" style={{ margin: 0 }}>
              Đang tải thông tin người tạo...
            </Tag>
          )}
        </div>
      </div>

      {/* Statistics Section */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                {newsData.length}
              </div>
              <div style={{ color: '#666' }}>Tổng tin tức</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {newsData.filter(item => item.status === NewsStatus.Published).length}
              </div>
              <div style={{ color: '#666' }}>Đã xuất bản</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                {newsData.filter(item => item.status === NewsStatus.Pending || item.status === NewsStatus.Updated).length}
              </div>
              <div style={{ color: '#666' }}>Cần duyệt</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>
                {newsData.filter(item => item.status === NewsStatus.Rejected).length}
              </div>
              <div style={{ color: '#666' }}>Đã từ chối</div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Top Staff Statistics */}
      {newsData.length > 0 && (
        <Card className="mb-4" title="Top 5 Nhân Viên Tạo Tin Tức" size="small">
          <Row gutter={[16, 8]}>
            {getStaffStatistics().map((staff, index) => (
              <Col span={12} key={staff.id}>
                <div style={{ 
                  padding: '8px 12px', 
                  border: '1px solid #f0f0f0', 
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Avatar size="small" icon={<UserOutlined />} />
                      <span style={{ fontWeight: 500 }}>{staff.name}</span>
                      <Tag color="blue" style={{ margin: 0 }}>#{index + 1}</Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                      ID: {staff.id !== 'unknown' ? `${staff.id.substring(0, 8)}...` : 'N/A'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                      {staff.count} tin
                    </div>
                    <div style={{ fontSize: 11, color: '#666' }}>
                      <span style={{ color: '#52c41a' }}>{staff.published}✓</span>
                      {' | '}
                      <span style={{ color: '#faad14' }}>{staff.pending}⏳</span>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

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
              <Option value="staffName">Tên người tạo</Option>
              <Option value="staffId">ID người tạo</Option>
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

      {/* View News Modal */}
      <ViewSpecificNews
        newsId={selectedNewsId}
        visible={viewModalVisible}
        onClose={handleCloseViewModal}
      />

      {/* Update Status Modal */}
      <UpdateNewsStatus
        newsId={selectedNewsForStatus}
        visible={updateStatusModalVisible}
        onClose={handleCloseUpdateStatusModal}
        onSuccess={handleUpdateStatusSuccess}
      />
    </div>
  );
};

export default NewsListPage; 