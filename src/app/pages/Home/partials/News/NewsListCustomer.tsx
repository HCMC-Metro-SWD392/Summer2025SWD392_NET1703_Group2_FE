import React, { useState, useEffect } from 'react';
import { Modal, Typography, Spin, Image, Divider, Tag, Button, message } from 'antd';
import { CalendarOutlined, UserOutlined, TagOutlined, FileTextOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import axiosInstance from '../../../../../settings/axiosInstance';

const { Title, Paragraph, Text } = Typography;

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
  status: number;
}

interface NewsListResponse {
  result: NewsItem[];
  message: string;
  isSuccess: boolean;
  statusCode: number;
}

const NewsListCustomer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<NewsListResponse>('/api/News/get-all-news-for-user');
      
      if (response.data?.isSuccess && response.data.result) {
        // Chỉ lấy tin tức đã được publish (status = 1)
        const publishedNews = response.data.result.filter(news => news.status === 1);
        setNewsList(publishedNews);
      } else {
        message.error(response.data?.message || 'Không thể tải danh sách tin tức');
      }
    } catch (error: any) {
      console.error('Error fetching news:', error);
      message.error('Đã xảy ra lỗi khi tải tin tức');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleNewsClick = (news: NewsItem) => {
    setSelectedNews(news);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedNews(null);
  };

  const handlePrevious = () => {
    if (newsList.length > 3) {
      setCurrentIndex(prev => (prev - 3 + newsList.length) % newsList.length);
    }
  };

  const handleNext = () => {
    if (newsList.length > 3) {
      setCurrentIndex(prev => (prev + 3) % newsList.length);
    }
  };

  // Lấy 3 tin tức để hiển thị
  const getDisplayedNews = () => {
    if (newsList.length <= 3) {
      return newsList;
    }
    
    const displayed = [];
    for (let i = 0; i < 3; i++) {
      displayed.push(newsList[(currentIndex + i) % newsList.length]);
    }
    return displayed;
  };

  const displayedNews = getDisplayedNews();

  if (loading) {
    return (
      <div className="text-center py-8">
        <Spin size="large" />
        <p className="mt-4 text-gray-500">Đang tải tin tức...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-blue-700 font-bold text-3xl">Tin tức</h2>
        {newsList.length > 3 && (
          <div className="flex gap-2">
            <Button
              type="primary"
              shape="circle"
              icon={<LeftOutlined />}
              onClick={handlePrevious}
              title="Tin tức trước"
            />
            <Button
              type="primary"
              shape="circle"
              icon={<RightOutlined />}
              onClick={handleNext}
              title="Tin tức tiếp theo"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {displayedNews.map(news => (
          <div 
            key={news.id} 
            className="bg-white rounded-xl shadow-md p-5 flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => handleNewsClick(news)}
          >
            <div className="text-xs text-gray-400 mb-2">{formatDate(news.createdAt)}</div>
            <div className="font-bold text-lg text-blue-800 mb-2" style={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {news.title}
            </div>
            <div className="text-gray-700 flex-1" style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {news.summary || news.content.substring(0, 150) + '...'}
            </div>
            <div className="mt-3">
              <Tag color="blue">{news.category}</Tag>
            </div>
          </div>
        ))}
      </div>

      {newsList.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Hiện tại chưa có tin tức nào</p>
        </div>
      )}

      {/* Modal chi tiết tin tức */}
      <Modal
        title="Chi Tiết Tin Tức"
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" type="primary" onClick={handleCloseModal}>
            Đóng
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        {selectedNews && (
          <div className="max-h-[70vh] overflow-y-auto">
            {/* Header Section */}
            <div className="mb-6">
              <Title level={3} className="mb-2">{selectedNews.title}</Title>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <TagOutlined />
                  <strong>Danh mục:</strong> {selectedNews.category}
                </span>
                {selectedNews.staffName && (
                  <span className="flex items-center gap-1">
                    <UserOutlined />
                    <strong>Tác giả:</strong> {selectedNews.staffName}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarOutlined />
                  <strong>Thời gian:</strong> {formatDateTime(selectedNews.createdAt)}
                </span>
              </div>
            </div>

            <Divider />

            {/* Image Section */}
            {selectedNews.imageUrl && (
              <div className="mb-6">
                <Text strong className="block mb-2">Hình ảnh:</Text>
                <Image
                  src={selectedNews.imageUrl}
                  alt={selectedNews.title}
                  style={{ maxWidth: '100%', maxHeight: '400px' }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8G+2gHxqMx8pj5Fp0/0G9m41uxvA4AASCSwQCrChpOiMADxBBnZhR2Aq8xPMOjyBkbBV9lhOhyMzm7hG8UVpZqan+3ble/X131W9jKNFAAAAAAAAAAAAAAAAAAAAAAAHADgAAAAAAAAAAAAMADQBAAQAhGlgM=" 
                />
              </div>
            )}

            {/* Summary Section */}
            {selectedNews.summary && (
              <div className="mb-6">
                <Text strong className="block mb-2">Tóm tắt:</Text>
                <Paragraph className="bg-gray-50 p-4 rounded border-l-4 border-blue-500">
                  {selectedNews.summary}
                </Paragraph>
              </div>
            )}

            {/* Content Section */}
            <div className="mb-6">
              <Text strong className="block mb-2 flex items-center gap-1">
                <FileTextOutlined />
                Nội dung chi tiết:
              </Text>
              <div className="prose max-w-none">
                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedNews.content}
                </Paragraph>
              </div>
            </div>

            {/* Footer Info */}
            {selectedNews.updatedAt && selectedNews.updatedAt !== '0001-01-01T00:00:00' && (
              <>
                <Divider />
                <div className="text-sm text-gray-500">
                  <span>
                    <strong>Cập nhật lần cuối:</strong> {formatDateTime(selectedNews.updatedAt)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>


    </div>
  );
};

export default NewsListCustomer;
