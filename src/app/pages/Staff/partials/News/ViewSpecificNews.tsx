import React, { useState, useEffect } from 'react';
import { Modal, Typography, Spin, message, Image, Tag, Row, Col, Divider, Button } from 'antd';
import { CalendarOutlined, UserOutlined, TagOutlined, FileTextOutlined, CloseOutlined } from '@ant-design/icons';
import axiosInstance from '../../../../../settings/axiosInstance';
import { NewsStatus } from './CreateNews';


const { Title, Paragraph, Text } = Typography;

interface NewsDetail {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  category: string;
  staffName: string;
  createdAt: string;
  updatedAt: string;
  status: NewsStatus;
  rejectionReason?: string; // Lý do từ chối
}

interface NewsDetailResponse {
  result: NewsDetail;
  message: string;
  isSuccess: boolean;
  statusCode: number;
}

interface ViewSpecificNewsProps {
  newsId: string | null;
  visible: boolean;
  onClose: () => void;
}

const ViewSpecificNews: React.FC<ViewSpecificNewsProps> = ({
  newsId,
  visible,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [newsDetail, setNewsDetail] = useState<NewsDetail | null>(null);

  useEffect(() => {
    if (visible && newsId) {
      fetchNewsDetail();
    }
  }, [visible, newsId]);

  const fetchNewsDetail = async () => {
    if (!newsId) return;

    setLoading(true);
    try {
      console.log(`[DEBUG] Fetching news detail for ID: ${newsId}`);
      console.log(`[DEBUG] Request URL: /api/News/get-news-by-id/${newsId}`);
      
      const response = await axiosInstance.get<NewsDetailResponse>(`/api/News/get-news-by-id/${newsId}`);
      
      console.log('[DEBUG] News detail response:', response.data);

      if (response.data?.isSuccess && response.data.result) {
        setNewsDetail(response.data.result);
        console.log('[DEBUG] News detail loaded successfully:', response.data.result);
        
        // Debug rejection reason if status is Rejected
        if (response.data.result.status === NewsStatus.Rejected) {
          console.log('[DEBUG] Rejection reason:', response.data.result.rejectionReason);
        }
      } else {
        message.error(response.data?.message || 'Không thể tải chi tiết tin tức');
        console.log('[DEBUG] Failed to load news detail:', response.data);
      }
    } catch (error: any) {
      console.error('Error fetching news detail:', error);
      console.error('[DEBUG] Error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
      });
      message.error(error?.response?.data?.message || 'Đã xảy ra lỗi khi tải chi tiết tin tức');
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

  const handleClose = () => {
    setNewsDetail(null);
    onClose();
  };



  return (
    <Modal
      title="Chi Tiết Tin Tức"
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button
          key="close"
          type="primary"
          icon={<CloseOutlined />}
          onClick={handleClose}
        >
          Đóng
        </Button>
      ]}
      width={800}
      style={{ top: 20 }}
    >
      {loading ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">Đang tải chi tiết tin tức...</p>
        </div>
      ) : newsDetail ? (
        <div className="max-h-[70vh] overflow-y-auto">
          {/* Header Section */}
          <div className="mb-6">
            <Title level={3} className="mb-2">{newsDetail.title}</Title>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1">
                <TagOutlined />
                <strong>Danh mục:</strong> {newsDetail.category}
              </span>
              <span className="flex items-center gap-1">
                <UserOutlined />
                <strong>Người viết:</strong> {newsDetail.staffName}
              </span>
              <span className="flex items-center gap-1">
                <CalendarOutlined />
                <strong>Thời gian tạo:</strong> {formatDateTime(newsDetail.createdAt)}
              </span>
            </div>
            <div className="mb-4">
              <strong>Trạng thái:</strong> {getStatusTag(newsDetail.status)}
            </div>
            
            {/* Rejection Reason Section - Only show if status is Rejected */}
            {newsDetail.status === NewsStatus.Rejected && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <Text strong className="text-red-600 block mb-2">Lý do từ chối:</Text>
                <Text className="text-red-700">
                  {newsDetail.rejectionReason || 'Không có lý do cụ thể được cung cấp'}
                </Text>
              </div>
            )}
          </div>

          <Divider />

          {/* Image Section */}
          {newsDetail.imageUrl && (
            <div className="mb-6">
              <Text strong className="block mb-2">Hình ảnh:</Text>
              <Image
                src={newsDetail.imageUrl}
                alt={newsDetail.title}
                style={{ maxWidth: '100%', maxHeight: '300px' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8G+2gHxqMx8pj5Fp0/0G9m41uxvA4AASCSwQCrChpOiMADxBBnZhR2Aq8xPMOjyBkbBV9lhOhyMzm7hG8UVpZqan+3ble/X131W9jKNFAAAAAAAAAAAAAAAAAAAAAAAHADgAAAAAAAAAAAAMADQBAAQAhGlgM=" 
              />
            </div>
          )}

          {/* Summary Section */}
          {newsDetail.summary && (
            <div className="mb-6">
              <Text strong className="block mb-2">Tóm tắt:</Text>
              <Paragraph className="bg-gray-50 p-4 rounded border-l-4 border-blue-500">
                {newsDetail.summary}
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
                {newsDetail.content}
              </Paragraph>
            </div>
          </div>

          {/* Footer Info */}
          {newsDetail.updatedAt && newsDetail.updatedAt !== '0001-01-01T00:00:00' && (
            <>
              <Divider />
              <div className="text-sm text-gray-500">
                <span>
                  <strong>Cập nhật lần cuối:</strong> {formatDateTime(newsDetail.updatedAt)}
                </span>
              </div>
            </>
          )}


        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Không thể tải chi tiết tin tức</p>
        </div>
      )}
    </Modal>
  );
};

export default ViewSpecificNews;
