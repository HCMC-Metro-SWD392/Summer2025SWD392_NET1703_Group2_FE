import React, { useState } from 'react';
import { Button, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../../settings/axiosInstance';

const { Title } = Typography;

// News Status Enum
export enum NewsStatus {
  Pending = 0,    // Đang chờ duyệt
  Published = 1,  // Đã xuất bản
  Rejected = 2,   // Đã từ chối
  Updated = 3,    // Đã cập nhật
}

interface CreateNewsData {
  title: string;
  content: string;
  summary: string;
  imageUrl: string;
  category: string;
  status: NewsStatus;
}

const CreateNews: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateNewsData>({
    title: '',
    content: '',
    summary: '',
    imageUrl: '',
    category: '',
    status: NewsStatus.Pending // Mặc định là Pending khi tạo mới
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Log initial state
  console.log('[DEBUG] CreateNews component initialized with initial form data:', {
    title: '',
    content: '',
    summary: '',
    imageUrl: '',
    category: '',
    status: NewsStatus.Pending
  });

  const handleInputChange = (field: keyof CreateNewsData, value: string) => {
    console.log(`[DEBUG] Input change - Field: ${field}, Value: "${value}"`);
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
    console.log('[DEBUG] Validating form with data:', formData);
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

    console.log('[DEBUG] Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);
    
    try {
      console.log('[DEBUG] Form data before processing:', formData);
      
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
      // Status is not included in the curl, so we might not need it
      // formDataPayload.append('Status', NewsStatus.Pending.toString());

      console.log('[DEBUG] FormData entries:');
      for (let [key, value] of formDataPayload.entries()) {
        console.log(`  ${key}: "${value}"`);
      }
      
      console.log('[DEBUG] Request URL: /api/News/create-news');
      console.log('[DEBUG] Request method: POST (multipart/form-data)');
      
      const response = await axiosInstance.post('/api/News/create-news', formDataPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      console.log('[DEBUG] Response received:', response.data);
      console.log('[DEBUG] Response status:', response.status);
      
      if (response.data?.isSuccess) {
        console.log('[DEBUG] Success! Message:', response.data?.message);
        message.success(response.data?.message || 'Tạo tin tức thành công!');
        
        // Reset form
        setFormData({
          title: '',
          content: '',
          summary: '',
          imageUrl: '',
          category: '',
          status: NewsStatus.Pending
        });
        setErrors({});
        console.log('[DEBUG] Form reset successfully');
        
        // Redirect to news list page after successful creation
        setTimeout(() => {
          navigate('/staff/news-list');
        }, 1500); // Delay để người dùng thấy message success
      } else {
        console.log('[DEBUG] Request failed. Response:', response.data);
        message.error(response.data?.message || 'Tạo tin tức thất bại');
      }
    } catch (error: any) {
      console.error('Error creating news:', error);
      console.error('[DEBUG] Error details:', {
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
      message.error(error?.response?.data?.message || error?.response?.data?.title || 'Đã xảy ra lỗi khi tạo tin tức');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      content: '',
      summary: '',
      imageUrl: '',
      category: '',
      status: NewsStatus.Pending
    });
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <Title level={3} className="mb-6 text-center">Tạo Tin Tức Mới</Title>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tiêu đề */}
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
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Nội dung */}
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
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
        </div>

        {/* Tóm tắt */}
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
          />
        </div>

        {/* URL hình ảnh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL hình ảnh
          </label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => handleInputChange('imageUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập URL hình ảnh"
          />
        </div>

        {/* Danh mục */}
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

        {/* Status Info */}
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Trạng thái:</strong> Pending (Đang chờ duyệt)
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Tin tức sẽ được tạo với trạng thái "Đang chờ duyệt" và cần được quản lý phê duyệt trước khi xuất bản.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            className="flex-1"
          >
            Tạo Tin Tức
          </Button>
          <Button
            type="default"
            onClick={handleReset}
            size="large"
            className="flex-1"
            disabled={loading}
          >
            Đặt Lại
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateNews;
