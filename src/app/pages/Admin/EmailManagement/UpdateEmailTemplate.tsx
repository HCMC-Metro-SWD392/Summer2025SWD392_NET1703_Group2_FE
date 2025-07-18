import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Modal, Button, message, Typography, Spin, Descriptions } from 'antd';
import axiosInstance from '../../../../settings/axiosInstance';

const { Title } = Typography;

const FOOTER_OPTIONS = [
  "© 2025 Metro HCMC. Tất cả quyền được bảo lưu. Email: support@metrohcmc.xyz | Hotline: 1900-6060",
  "© 2025 Metro HCMC. All rights reserved. Email: support@metrohcmc.xyz | Hotline: 1900-6060"
];
const SENDER_OPTIONS = [
  "Metro HCMC",
  "Metro HCMC Team"
];
const LANGUAGE_OPTIONS = [
  "Vietnamese",
  "English"
];

interface UpdateEmailTemplateProps {
  templateId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const UpdateEmailTemplate: React.FC<UpdateEmailTemplateProps> = ({ templateId, open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const location = useLocation();
  const templateData = location.state;

  // Form state
  const [formData, setFormData] = useState({
    templateName: '',
    subjectLine: '',
    bodyContent: '',
    senderName: '',
    category: '',
    preHeaderText: '',
    personalizationTags: '',
    footerContent: '',
    callToAction: '',
    language: '',
    recipientType: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Load initial data
  useEffect(() => {
    if (templateData) {
      setFormData(templateData);
      // Lưu vào localStorage để fallback nếu F5 hoặc vào lại
      localStorage.setItem('update_email_template_data', JSON.stringify({ id: templateId, data: templateData }));
    } else {
      // Nếu không có state, thử lấy từ localStorage
      const local = localStorage.getItem('update_email_template_data');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed.id === templateId && parsed.data) {
            setFormData(parsed.data);
          }
        } catch {}
      }
    }
  }, [templateData, templateId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.templateName.trim()) newErrors.templateName = 'Tên template là bắt buộc';
    if (!formData.subjectLine.trim()) newErrors.subjectLine = 'Tiêu đề là bắt buộc';
    if (!formData.bodyContent.trim()) newErrors.bodyContent = 'Nội dung là bắt buộc';
    if (!formData.senderName.trim()) newErrors.senderName = 'Tên người gửi là bắt buộc';
    if (!formData.category.trim()) newErrors.category = 'Danh mục là bắt buộc';
    if (!formData.preHeaderText.trim()) newErrors.preHeaderText = 'Pre-header text là bắt buộc';
    if (!formData.personalizationTags.trim()) newErrors.personalizationTags = 'Personalization tags là bắt buộc';
    if (!formData.footerContent.trim()) newErrors.footerContent = 'Footer là bắt buộc';
    if (!formData.callToAction.trim()) newErrors.callToAction = 'Call to action là bắt buộc';
    if (!formData.language.trim()) newErrors.language = 'Ngôn ngữ là bắt buộc';
    if (!formData.recipientType.trim()) newErrors.recipientType = 'Loại người nhận là bắt buộc';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setPreviewData(formData);
      setPreviewVisible(true);
    }
  };

  const handleUpdate = async () => {
    if (!previewData) return;
    setLoading(true);
    console.log('[DEBUG] UPDATE templateId:', templateId, 'data:', previewData);
    try {
      const res = await axiosInstance.put(`/api/Email/update-email-template/${templateId}`, previewData);
      if (res.data?.isSuccess) {
        message.success(res.data?.message || 'Cập nhật template thành công!');
        setPreviewVisible(false);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        message.error(res.data?.message || 'Cập nhật thất bại.');
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Đã xảy ra lỗi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewCancel = () => {
    setPreviewVisible(false);
  };

  return (
    <Modal
      open={open}
      title={<Title level={4} style={{ margin: 0 }}>Cập nhật Email Template</Title>}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      {fetching ? <Spin /> : (
        <form onSubmit={handlePreview} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Tên Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên Template <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.templateName}
                onChange={(e) => handleInputChange('templateName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.templateName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập tên template"
              />
              {errors.templateName && <p className="text-red-500 text-sm mt-1">{errors.templateName}</p>}
            </div>

            {/* Tiêu Đề */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu Đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subjectLine}
                onChange={(e) => handleInputChange('subjectLine', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.subjectLine ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập tiêu đề email"
              />
              {errors.subjectLine && <p className="text-red-500 text-sm mt-1">{errors.subjectLine}</p>}
            </div>

            {/* Nội Dung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội Dung <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={8}
                value={formData.bodyContent}
                onChange={(e) => handleInputChange('bodyContent', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.bodyContent ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập nội dung email"
              />
              {errors.bodyContent && <p className="text-red-500 text-sm mt-1">{errors.bodyContent}</p>}
            </div>

            {/* Tên Người Gửi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên Người Gửi <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.senderName}
                onChange={(e) => handleInputChange('senderName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.senderName ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn tên người gửi</option>
                {SENDER_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.senderName && <p className="text-red-500 text-sm mt-1">{errors.senderName}</p>}
            </div>

            {/* Danh Mục */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh Mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập danh mục"
              />
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Pre-header Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pre-header Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.preHeaderText}
                onChange={(e) => handleInputChange('preHeaderText', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.preHeaderText ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập pre-header text"
              />
              {errors.preHeaderText && <p className="text-red-500 text-sm mt-1">{errors.preHeaderText}</p>}
            </div>

            {/* Personalization Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personalization Tags <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.personalizationTags}
                onChange={(e) => handleInputChange('personalizationTags', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.personalizationTags ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập personalization tags"
              />
              {errors.personalizationTags && <p className="text-red-500 text-sm mt-1">{errors.personalizationTags}</p>}
            </div>

            {/* Footer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Footer <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.footerContent}
                onChange={(e) => handleInputChange('footerContent', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.footerContent ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn footer</option>
                {FOOTER_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.footerContent && <p className="text-red-500 text-sm mt-1">{errors.footerContent}</p>}
            </div>

            {/* Call To Action */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call To Action <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.callToAction}
                onChange={(e) => handleInputChange('callToAction', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.callToAction ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập call to action"
              />
              {errors.callToAction && <p className="text-red-500 text-sm mt-1">{errors.callToAction}</p>}
            </div>

            {/* Ngôn Ngữ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngôn Ngữ <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.language ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn ngôn ngữ</option>
                {LANGUAGE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language}</p>}
            </div>

            {/* Loại Người Nhận */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại Người Nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.recipientType}
                onChange={(e) => handleInputChange('recipientType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.recipientType ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập loại người nhận"
              />
              {errors.recipientType && <p className="text-red-500 text-sm mt-1">{errors.recipientType}</p>}
            </div>
          </div>

          <Button type="primary" htmlType="submit" loading={loading} block size="large" className="mt-6">
            Xem trước & Cập nhật
          </Button>
        </form>
      )}

      <Modal
        open={previewVisible}
        title="Xem trước Email Template"
        onCancel={handlePreviewCancel}
        onOk={handleUpdate}
        okText="Xác nhận cập nhật"
        cancelText="Quay lại chỉnh sửa"
        width={900}
        confirmLoading={loading}
      >
        {previewData && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Tên Template">{previewData.templateName}</Descriptions.Item>
            <Descriptions.Item label="Tiêu Đề">{previewData.subjectLine}</Descriptions.Item>
            <Descriptions.Item label="Nội Dung">
              <div style={{ background: '#f9f9f9', padding: 12, borderRadius: 4, maxHeight: 300, overflow: 'auto' }}>
                <div dangerouslySetInnerHTML={{ __html: previewData.bodyContent }} />
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Tên Người Gửi">{previewData.senderName}</Descriptions.Item>
            <Descriptions.Item label="Danh Mục">{previewData.category}</Descriptions.Item>
            <Descriptions.Item label="Pre-header Text">{previewData.preHeaderText}</Descriptions.Item>
            <Descriptions.Item label="Personalization Tags">{previewData.personalizationTags}</Descriptions.Item>
            <Descriptions.Item label="Footer">{previewData.footerContent}</Descriptions.Item>
            <Descriptions.Item label="Call To Action">{previewData.callToAction}</Descriptions.Item>
            <Descriptions.Item label="Ngôn Ngữ">{previewData.language}</Descriptions.Item>
            <Descriptions.Item label="Loại Người Nhận">{previewData.recipientType}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Modal>
  );
};

export default UpdateEmailTemplate;
