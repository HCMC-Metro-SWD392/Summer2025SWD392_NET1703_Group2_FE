import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Typography, Space, Alert, message, Checkbox, Spin, Image, Divider, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, CloseOutlined, CalendarOutlined, UserOutlined, TagOutlined, FileTextOutlined } from '@ant-design/icons';
import axiosInstance from '../../../../settings/axiosInstance';
import { NewsStatus } from '../../Staff/partials/News/CreateNews';

const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;

interface UpdateNewsStatusProps {
  newsId: string | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: (newsId: string, newStatus: NewsStatus) => void;
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

interface NewsDetailResponse {
  result: NewsDetail;
  message: string;
  isSuccess: boolean;
  statusCode: number;
}

interface ChangeStatusRequest {
  Status: number;
  RejectionReason?: string;
}

const UpdateNewsStatus: React.FC<UpdateNewsStatusProps> = ({
  newsId,
  visible,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [newsDetail, setNewsDetail] = useState<NewsDetail | null>(null);
  const [approveChecked, setApproveChecked] = useState(false);
  const [rejectChecked, setRejectChecked] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible && newsId) {
      fetchNewsDetail();
    }
  }, [visible, newsId]);

  const fetchNewsDetail = async () => {
    if (!newsId) return;

    setLoading(true);
    try {
      // console.log(`[DEBUG] Fetching news detail for ID: ${newsId}`);
      const response = await axiosInstance.get<NewsDetailResponse>(`/api/News/get-news-by-id/${newsId}`);
      
      // console.log('[DEBUG] News detail response:', response.data);

      if (response.data?.isSuccess && response.data.result) {
        setNewsDetail(response.data.result);
        // console.log('[DEBUG] News detail loaded successfully:', response.data.result);
      } else {
        message.error(response.data?.message || 'Không thể tải chi tiết tin tức');
        console.log('[DEBUG] Failed to load news detail:', response.data);
      }
    } catch (error: any) {
      console.error('Error fetching news detail:', error);
      message.error(error?.response?.data?.message || 'Đã xảy ra lỗi khi tải chi tiết tin tức');
    } finally {
      setLoading(false);
    }
  };

  const validateReject = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!rejectionReason.trim()) {
      newErrors.rejectionReason = 'Vui lòng nhập lý do từ chối';
    } else if (rejectionReason.trim().length < 10) {
      newErrors.rejectionReason = 'Lý do từ chối phải có ít nhất 10 ký tự';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApproveChange = (checked: boolean) => {
    if (checked) {
      setRejectChecked(false);
      setRejectionReason('');
      setErrors({});
    }
    setApproveChecked(checked);
  };

  const handleRejectChange = (checked: boolean) => {
    if (checked) {
      setApproveChecked(false);
    }
    setRejectChecked(checked);
    if (!checked) {
      setRejectionReason('');
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!newsId) return;
    
    if (!approveChecked && !rejectChecked) {
      message.warning('Vui lòng chọn duyệt hoặc từ chối tin tức');
      return;
    }

    if (rejectChecked && !validateReject()) {
      return;
    }

    setLoading(true);
    try {
      // Tạo FormData theo curl spec: multipart/form-data
      const formData = new FormData();
      
      if (approveChecked) {
        formData.append('Status', '1');
      } else {
        formData.append('Status', '2');
        formData.append('RejectionReason', rejectionReason.trim());
      }

      // Debug FormData
      console.log('[DEBUG] FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: "${value}"`);
      }

      let response = await axiosInstance.put(
        `/api/News/change-news-status/${newsId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // console.log('[DEBUG] Response status:', response.status);
      // console.log('[DEBUG] Response data:', response.data);
      
      // Kiểm tra success - có thể API không trả về isSuccess field
      const isSuccess = response.data?.isSuccess !== false && response.status === 200;
      
      if (isSuccess) {
        const successMessage = approveChecked 
          ? 'Tin tức đã được duyệt và xuất bản!' 
          : 'Đã từ chối tin tức!';
        message.success(successMessage);
        
        onSuccess(newsId, approveChecked ? NewsStatus.Published : NewsStatus.Rejected);
        
        // Reset form và đóng modal
        setApproveChecked(false);
        setRejectChecked(false);
        setRejectionReason('');
        setErrors({});
        onClose();
      } else {
        message.error(response.data?.message || 'Không thể cập nhật trạng thái tin tức');
      }
    } catch (error: any) {
      console.error('Error changing news status:', error);
      message.error(error?.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật trạng thái');
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
    setApproveChecked(false);
    setRejectChecked(false);
    setRejectionReason('');
    setErrors({});
    onClose();
  };

  const canUpdateStatus = newsDetail && (newsDetail.status === NewsStatus.Pending || newsDetail.status === NewsStatus.Updated);

  return (
    <Modal
      title="Duyệt Tin Tức"
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button
          key="close"
          icon={<CloseOutlined />}
          onClick={handleClose}
        >
          Đóng
        </Button>
      ]}
      width={900}
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

          {/* Status Update Section */}
          {canUpdateStatus && (
            <>
              <Divider />
              <div style={{ marginTop: 24 }}>
                <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
                  🎯 Duyệt tin tức:
                </Text>
                
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Checkbox
                        checked={approveChecked}
                        onChange={(e) => handleApproveChange(e.target.checked)}
                        disabled={loading}
                        style={{ fontSize: 16 }}
                      >
                        <span style={{ marginLeft: 8 }}>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          Duyệt & Xuất bản tin tức
                        </span>
                      </Checkbox>
                      
                      <Checkbox
                        checked={rejectChecked}
                        onChange={(e) => handleRejectChange(e.target.checked)}
                        disabled={loading}
                        style={{ fontSize: 16 }}
                      >
                        <span style={{ marginLeft: 8 }}>
                          <CloseCircleOutlined style={{ color: '#f5222d', marginRight: 8 }} />
                          Từ chối tin tức
                        </span>
                      </Checkbox>
                    </Space>
                  </div>

                  {rejectChecked && (
                    <div style={{ marginLeft: 24, marginTop: 16 }}>
                      <Text strong className="block mb-2">
                        Lý do từ chối <span style={{ color: '#f5222d' }}>*</span>
                      </Text>
                      <TextArea
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        placeholder="Nhập lý do từ chối tin tức này..."
                        rows={4}
                        className={errors.rejectionReason ? 'border-red-500' : ''}
                        showCount
                        maxLength={500}
                        style={{ marginBottom: 8 }}
                      />
                      {errors.rejectionReason && (
                        <div style={{ color: '#f5222d', fontSize: 14, marginBottom: 8 }}>
                          {errors.rejectionReason}
                        </div>
                      )}
                      <Alert
                        message="Lưu ý"
                        description="Lý do từ chối sẽ được gửi đến nhân viên tạo tin tức để họ biết và cải thiện."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                    </div>
                  )}

                  {(approveChecked || rejectChecked) && (
                    <div style={{ marginTop: 16 }}>
                      <Button
                        type="primary"
                        loading={loading}
                        onClick={handleSubmit}
                        style={{ marginRight: 8 }}
                        size="large"
                      >
                        {approveChecked ? '✅ Xác nhận duyệt' : '❌ Xác nhận từ chối'}
                      </Button>
                      <Button
                        onClick={() => {
                          setApproveChecked(false);
                          setRejectChecked(false);
                          setRejectionReason('');
                          setErrors({});
                        }}
                        disabled={loading}
                        size="large"
                      >
                        Hủy
                      </Button>
                    </div>
                  )}
                </Space>
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

export default UpdateNewsStatus;
