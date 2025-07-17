import React from 'react';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import axiosInstance from '../../../../settings/axiosInstance';

const { confirm } = Modal;

interface DeleteNewsProps {
  newsId: string;
  newsTitle: string;
  onDeleteSuccess: () => void;
}

interface DeleteNewsResponse {
  message: string;
  isSuccess: boolean;
  statusCode: number;
}

const DeleteNews = {
  showConfirm: ({ newsId, newsTitle, onDeleteSuccess }: DeleteNewsProps) => {
    confirm({
      title: 'Xác nhận xóa tin tức',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa tin tức:</p>
          <p><strong>"{newsTitle}"</strong></p>
          <p className="text-red-500 text-sm mt-2">
            ⚠️ Hành động này không thể hoàn tác!
          </p>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      width: 450,
      onOk: async () => {
        try {
          console.log('[DEBUG] Deleting news with ID:', newsId);
          
          const response = await axiosInstance.delete<DeleteNewsResponse>(
            `/api/News/delete-news/${newsId}`
          );
          
          console.log('[DEBUG] Delete response:', response.data);
          
          if (response.data?.isSuccess) {
            message.success('Xóa tin tức thành công!');
            onDeleteSuccess(); // Refresh the news list
          } else {
            message.error(response.data?.message || 'Không thể xóa tin tức');
          }
        } catch (error: any) {
          console.error('[ERROR] Delete news failed:', error);
          
          if (error?.response?.status === 404) {
            message.error('Tin tức không tồn tại hoặc đã được xóa');
          } else if (error?.response?.status === 403) {
            message.error('Bạn không có quyền xóa tin tức này');
          } else {
            message.error(
              error?.response?.data?.message || 
              'Có lỗi xảy ra khi xóa tin tức. Vui lòng thử lại!'
            );
          }
        }
      },
      onCancel: () => {
        console.log('[DEBUG] Delete news cancelled');
      },
    });
  }
};

export default DeleteNews;
