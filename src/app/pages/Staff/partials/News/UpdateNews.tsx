import React, { useState, useEffect } from 'react';
import { Modal, Button, message, Typography, Spin } from 'antd';
import { EditOutlined, CloseOutlined } from '@ant-design/icons';
import axiosInstance from '../../../../../settings/axiosInstance';
import { NewsStatus } from './CreateNews';

const { Title, Text } = Typography;

interface UpdateNewsData {
  title: string;
  content: string;
  summary: string;
  imageUrl: string;
  category: string;
}

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
}

interface UpdateNewsProps {
  newsId: string | null;
  visible: boolean;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

const UpdateNews: React.FC<UpdateNewsProps> = ({
  newsId,
  visible,
  onClose,
  onUpdateSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [formData, setFormData] = useState<UpdateNewsData>({
    title: '',
    content: '',
    summary: '',
    imageUrl: '',
    category: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [originalData, setOriginalData] = useState<NewsDetail | null>(null);

  useEffect(() => {
    if (visible && newsId) {
      fetchNewsDetail();
    }
  }, [visible, newsId]);

  const fetchNewsDetail = async () => {
    if (!newsId) return;

    setLoadingDetail(true);
    try {
      console.log(`[DEBUG] Fetching news detail for update - ID: ${newsId}`);
      
      const response = await axiosInstance.get(`/api/News/get-news-by-id/${newsId}`);
      
      console.log('[DEBUG] News detail response for update:', response.data);

      if (response.data?.isSuccess && response.data.result) {
        const newsDetail = response.data.result;
        setOriginalData(newsDetail);
        
        // Populate form with existing data
        setFormData({
          title: newsDetail.title || '',
          content: newsDetail.content || '',
          summary: newsDetail.summary || '',
          imageUrl: newsDetail.imageUrl || '',
          category: newsDetail.category || '',
        });
        
        console.log('[DEBUG] Form populated with existing data:', newsDetail);
      } else {
        message.error(response.data?.message || 'Không thể tải thông tin tin tức');
      }
    } catch (error: any) {
      console.error('Error fetching news detail for update:', error);
      message.error(error?.response?.data?.message || 'Đã xảy ra lỗi khi tải thông tin tin tức');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleInputChange = (field: keyof UpdateNewsData, value: string) => {
    console.log(`[DEBUG] Update input change - Field: ${field}, Value: "${value}"`);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('[DEBUG] Updated form data:', newData);
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    console.log('[DEBUG] Validating update form with data:', formData);
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung là bắt buộc';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Danh mục là bắt buộc';
    }

    console.log('[DEBUG] Update validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsId) {
      message.error('Không tìm thấy ID tin tức');
      return;
    }
    
    if (!validateForm()) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);
    
    try {
      console.log('[DEBUG] Form data before updating:', formData);
      
      // Create FormData object for multipart/form-data
      const formDataPayload = new FormData();
      formDataPayload.append('Title', formData.title.trim());
      formDataPayload.append('Content', formData.content.trim());
      
      // Only append optional fields if they have values
      if (formData.summary.trim()) {
        formDataPayload.append('Summary', formData.summary.trim());
      }
      if (formData.imageUrl.trim()) {
        formDataPayload.append('ImageUrl', formData.imageUrl.trim());
      }
      
      formDataPayload.append('Category', formData.category.trim());

      console.log('[DEBUG] Update FormData entries:');
      for (let [key, value] of formDataPayload.entries()) {
        console.log(`  ${key}: "${value}"`);
      }
      
      console.log(`[DEBUG] Request URL: /api/News/update-news/${newsId}`);
      console.log('[DEBUG] Request method: PUT (multipart/form-data)');
      
      const response = await axiosInstance.put(`/api/News/update-news/${newsId}`, formDataPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      console.log('[DEBUG] Update response received:', response.data);
      console.log('[DEBUG] Update response status:', response.status);
      
      if (response.data?.isSuccess) {
        console.log('[DEBUG] Update success! Message:', response.data?.message);
        message.success(response.data?.message || 'Cập nhật tin tức thành công!');
        
        // Call success callback to refresh the list
        onUpdateSuccess();
        
        // Close modal
        handleClose();
        
        console.log('[DEBUG] Update completed successfully');
      } else {
        console.log('[DEBUG] Update failed. Response:', response.data);
        message.error(response.data?.message || 'Cập nhật tin tức thất bại');
      }
    } catch (error: any) {
      console.error('Error updating news:', error);
      console.error('[DEBUG] Update error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        headers: error?.response?.headers,
        config: {
          url: error?.config?.url,
          method: error?.config?.method,
          data: error?.config?.data,
          headers: error?.config?.headers
        }
      });
      message.error(error?.response?.data?.message || error?.response?.data?.title || 'Đã xảy ra lỗi khi cập nhật tin tức');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      summary: '',
      imageUrl: '',
      category: '',
    });
    setErrors({});
    setOriginalData(null);
    onClose();
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

  return (
    <Modal
      title="Cập Nhật Tin Tức"
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button
          key="cancel"
          onClick={handleClose}
          disabled={loading}
        >
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<EditOutlined />}
          loading={loading}
          onClick={handleSubmit}
        >
          Cập Nhật
        </Button>
      ]}
      width={900}
      style={{ top: 20 }}
      maskClosable={!loading}
    >
      {loadingDetail ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">Đang tải thông tin tin tức...</p>
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto">
          {/* Original Info */}
          {originalData && (
            <div className="mb-6 p-4 bg-blue-50 rounded-md">
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Tin tức được tạo:</strong> {formatDateTime(originalData.createdAt)}</p>
                <p><strong>Người tạo:</strong> {originalData.staffName}</p>
                {originalData.updatedAt && originalData.updatedAt !== '0001-01-01T00:00:00' && (
                  <p><strong>Cập nhật lần cuối:</strong> {formatDateTime(originalData.updatedAt)}</p>
                )}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập tiêu đề tin tức"
                disabled={loadingDetail}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập nội dung tin tức"
                disabled={loadingDetail}
              />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tóm tắt
              </label>
              <textarea
                rows={3}
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tóm tắt tin tức"
                disabled={loadingDetail}
              />
            </div>

            {/* ImageUrl */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Hình ảnh
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập URL hình ảnh"
                disabled={loadingDetail}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loadingDetail}
              >
                <option value="">Chọn danh mục</option>
                <option value="Thông báo">Thông báo</option>
                <option value="Tin tức">Tin tức</option>
                <option value="Khuyến mãi">Khuyến mãi</option>
                <option value="Sự kiện">Sự kiện</option>
                <option value="Bảo trì">Bảo trì</option>
                <option value="An toàn">An toàn</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Update Info */}
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Tin tức sau khi cập nhật sẽ được đánh dấu thời gian cập nhật mới.
              </p>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

export default UpdateNews;
