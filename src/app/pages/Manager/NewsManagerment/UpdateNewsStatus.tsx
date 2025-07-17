import React, { useState } from 'react';
import { Modal, Button, message, Radio, Input, Typography, Space, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axiosInstance from '../../../../settings/axiosInstance';
import { NewsStatus } from '../../Staff/partials/News/CreateNews';

const { TextArea } = Input;
const { Text } = Typography;

interface UpdateNewsStatusProps {
  newsId: string | null;
  newsTitle: string;
  currentStatus: NewsStatus;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ChangeStatusRequest {
  status: number;
  rejectionReason?: string;
}

interface ChangeStatusResponse {
  isSuccess: boolean;
  message: string;
  statusCode: number;
}

const UpdateNewsStatus: React.FC<UpdateNewsStatusProps> = ({
  newsId,
  newsTitle,
  currentStatus,
  visible,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number>(NewsStatus.Published);
  const [rejectionReason, setRejectionReason] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleStatusChange = (value: number) => {
    setSelectedStatus(value);
    setErrors({});
    
    // Clear rejection reason khi chọn Published
    if (value === NewsStatus.Published) {
      setRejectionReason('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Kiểm tra rejection reason khi status là Rejected
    if (selectedStatus === NewsStatus.Rejected) {
      if (!rejectionReason.trim()) {
        newErrors.rejectionReason = 'Vui lòng nhập lý do từ chối';
      } else if (rejectionReason.trim().length < 10) {
        newErrors.rejectionReason = 'Lý do từ chối phải có ít nhất 10 ký tự';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!newsId) {
      message.error('Không tìm thấy ID tin tức');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const requestBody: ChangeStatusRequest = {
        status: selectedStatus,
      };

      // Thêm rejection reason nếu status là Rejected
      if (selectedStatus === NewsStatus.Rejected) {
        requestBody.rejectionReason = rejectionReason.trim();
      }

      console.log('[DEBUG] Changing news status:', {
        newsId,
        requestBody,
      });

      const response = await axiosInstance.put<ChangeStatusResponse>(
        `/api/News/change-news-status/${newsId}`,
        requestBody
      );

      console.log('[DEBUG] Change status response:', response.data);

      if (response.data?.isSuccess) {
        const statusText = selectedStatus === NewsStatus.Published ? 'duyệt' : 'từ chối';
        message.success(`Đã ${statusText} tin tức thành công`);
        onSuccess();
        handleClose();
      } else {
        message.error(response.data?.message || 'Không thể thay đổi trạng thái tin tức');
      }
    } catch (error: any) {
      console.error('Error changing news status:', error);
      message.error(error?.response?.data?.message || 'Đã xảy ra lỗi khi thay đổi trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus(NewsStatus.Published);
    setRejectionReason('');
    setErrors({});
    onClose();
  };

  const getStatusConfig = () => {
    switch (currentStatus) {
      case NewsStatus.Pending:
        return { color: 'orange', text: 'Đang chờ duyệt' };
      case NewsStatus.Published:
        return { color: 'green', text: 'Đã xuất bản' };
      case NewsStatus.Rejected:
        return { color: 'red', text: 'Đã từ chối' };
      case NewsStatus.Updated:
        return { color: 'blue', text: 'Đã cập nhật' };
      default:
        return { color: 'default', text: 'Không rõ' };
    }
  };

  const currentStatusConfig = getStatusConfig();

  return (
    <Modal
      title="Duyệt Tin Tức"
      open={visible}
      onCancel={handleClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={loading}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          icon={selectedStatus === NewsStatus.Published ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {selectedStatus === NewsStatus.Published ? 'Duyệt tin tức' : 'Từ chối tin tức'}
        </Button>,
      ]}
    >
      <div className="space-y-6">
        {/* Thông tin tin tức */}
        <div>
          <Text strong>Tin tức:</Text>
          <div className="mt-2 p-3 bg-gray-50 rounded border">
            <div className="font-medium">{newsTitle}</div>
            <div className="text-sm text-gray-600 mt-1">
              Trạng thái hiện tại: 
              <span className={`ml-1 font-medium text-${currentStatusConfig.color}-600`}>
                {currentStatusConfig.text}
              </span>
            </div>
          </div>
        </div>

        {/* Chọn trạng thái mới */}
        <div>
          <Text strong className="block mb-3">Chọn hành động:</Text>
          <Radio.Group
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full"
          >
            <Space direction="vertical" className="w-full">
              <Radio value={NewsStatus.Published} className="w-full">
                <div className="flex items-center">
                  <CheckCircleOutlined className="text-green-500 mr-2" />
                  <div>
                    <div className="font-medium text-green-600">Duyệt và xuất bản</div>
                    <div className="text-sm text-gray-500">Tin tức sẽ được xuất bản công khai</div>
                  </div>
                </div>
              </Radio>
              <Radio value={NewsStatus.Rejected} className="w-full">
                <div className="flex items-center">
                  <CloseCircleOutlined className="text-red-500 mr-2" />
                  <div>
                    <div className="font-medium text-red-600">Từ chối</div>
                    <div className="text-sm text-gray-500">Tin tức sẽ bị từ chối và không được xuất bản</div>
                  </div>
                </div>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {/* Lý do từ chối */}
        {selectedStatus === NewsStatus.Rejected && (
          <div>
            <Text strong className="block mb-2">
              Lý do từ chối <span className="text-red-500">*</span>
            </Text>
            <TextArea
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (errors.rejectionReason) {
                  setErrors(prev => ({ ...prev, rejectionReason: '' }));
                }
              }}
              placeholder="Nhập lý do từ chối tin tức này..."
              rows={4}
              className={errors.rejectionReason ? 'border-red-500' : ''}
              showCount
              maxLength={500}
            />
            {errors.rejectionReason && (
              <div className="text-red-500 text-sm mt-1">{errors.rejectionReason}</div>
            )}
            <Alert
              message="Lưu ý"
              description="Lý do từ chối sẽ được gửi đến nhân viên tạo tin tức để họ biết và cải thiện."
              type="info"
              showIcon
              className="mt-3"
            />
          </div>
        )}

        {/* Thông báo xác nhận */}
        {selectedStatus === NewsStatus.Published && (
          <Alert
            message="Xác nhận duyệt tin tức"
            description="Tin tức sẽ được xuất bản và hiển thị công khai cho người dùng."
            type="success"
            showIcon
          />
        )}
      </div>
    </Modal>
  );
};

export default UpdateNewsStatus;
