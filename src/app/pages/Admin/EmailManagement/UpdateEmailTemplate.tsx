import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Modal, Form, Input, Button, message, Typography, Select, Spin, Descriptions } from 'antd';
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
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const location = useLocation();
  const templateData = location.state;

  // Nếu có state truyền sang thì set initialValues cho form
  useEffect(() => {
    if (templateData) {
      form.setFieldsValue(templateData);
      // Lưu vào localStorage để fallback nếu F5 hoặc vào lại
      localStorage.setItem('update_email_template_data', JSON.stringify({ id: templateId, data: templateData }));
    } else {
      // Nếu không có state, thử lấy từ localStorage
      const local = localStorage.getItem('update_email_template_data');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed.id === templateId && parsed.data) {
            form.setFieldsValue(parsed.data);
          } else {
            // Nếu không đúng id, gọi API lấy chi tiết (nếu muốn)
            // setFetching(true);
            // axiosInstance.get(`/api/Email/get-email-template/${templateId}`)
            //   .then(res => {
            //     if (res.data) form.setFieldsValue(res.data);
            //   })
            //   .catch(() => message.error('Không lấy được thông tin template!'))
            //   .finally(() => setFetching(false));
          }
        } catch {}
      }
    }
  }, [templateData, templateId, form]);

  const handlePreview = (values: any) => {
    setPreviewData(values);
    setPreviewVisible(true);
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
    // Không reset form, giữ nguyên giá trị đã nhập
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
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePreview}
          initialValues={templateData || {}} // nếu có state thì set initialValues
        >
          <Form.Item name="templateName" label="Tên Template" rules={[{ required: true, message: 'Bắt buộc' }]}> <Input /> </Form.Item>
          <Form.Item name="subjectLine" label="Tiêu Đề" rules={[{ required: true, message: 'Bắt buộc' }]}> <Input /> </Form.Item>
          <Form.Item name="bodyContent" label="Nội Dung" rules={[{ required: true, message: 'Bắt buộc' }]}> <Input.TextArea rows={8} /> </Form.Item>
          <Form.Item name="senderName" label="Tên Người Gửi" rules={[{ required: true, message: 'Bắt buộc' }]}> 
            <Select>
              {SENDER_OPTIONS.map(opt => <Select.Option key={opt} value={opt}>{opt}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="category" label="Danh Mục" rules={[{ required: true, message: 'Bắt buộc' }]}> <Input /> </Form.Item>
          <Form.Item name="preHeaderText" label="Pre-header Text" rules={[{ required: true, message: 'Bắt buộc' }]}> <Input /> </Form.Item>
          <Form.Item name="personalizationTags" label="Personalization Tags" rules={[{ required: true, message: 'Bắt buộc' }]}> <Input /> </Form.Item>
          <Form.Item name="footerContent" label="Footer" rules={[{ required: true, message: 'Bắt buộc' }]}> 
            <Select>
              {FOOTER_OPTIONS.map(opt => <Select.Option key={opt} value={opt}>{opt}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="callToAction" label="Call To Action" rules={[{ required: true, message: 'Bắt buộc' }]}> <Input /> </Form.Item>
          <Form.Item name="language" label="Ngôn Ngữ" rules={[{ required: true, message: 'Bắt buộc' }]}> 
            <Select>
              {LANGUAGE_OPTIONS.map(opt => <Select.Option key={opt} value={opt}>{opt}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="recipientType" label="Loại Người Nhận" rules={[{ required: true, message: 'Bắt buộc' }]}> <Input /> </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Xem trước & Cập nhật
            </Button>
          </Form.Item>
        </Form>
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
