import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Typography, Modal, Descriptions, Select } from 'antd';
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
const LOCAL_KEY = 'admin_create_email_template_form';

const CreateEmailTemplate: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Load dữ liệu từ localStorage khi mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      form.setFieldsValue(JSON.parse(saved));
    }
  }, [form]);

  // Lưu dữ liệu vào localStorage mỗi khi thay đổi
  const handleValuesChange = (changed: any, all: any) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
  };

  // Khi bấm submit form, show modal preview
  const onFinish = (values: any) => {
    setPreviewData(values);
    setPreviewVisible(true);
  };

  // Khi xác nhận ở modal, gửi request
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/api/Email/create-eamil-template', previewData);
      if (res.data?.isSuccess) {
        message.success(res.data?.message || 'Tạo email template thành công!');
        form.resetFields();
        setPreviewVisible(false);
        setPreviewData(null);
        localStorage.removeItem(LOCAL_KEY);
      } else {
        message.error(res.data?.message || 'Tạo email template thất bại.');
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Title level={2}>Tạo Email Template</Title>
      <Card className="mt-4">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={handleValuesChange}
        >
          <Form.Item name="templateName" label="Tên Template" initialValue="Welcome New Registration"> <Input /> </Form.Item>
          <Form.Item name="subjectLine" label="Tiêu Đề" initialValue="Chào mừng bạn đến với Metro HCMC!"> <Input /> </Form.Item>
          <Form.Item name="bodyContent" label="Nội Dung" initialValue={`<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='UTF-8'>
    <title>Chào mừng đến Metro HCMC</title>
</head>
<body style='font-family: Inter, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0;'>
    <div style='max-width:600px;margin:40px auto;background:#fff;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.05);padding:40px;'>
        <h1 style='color:#1e40af;text-align:center;'>Chào mừng bạn đến với Metro HCMC!</h1>
        <p>Xin chào <b>{userName}</b>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản Metro HCMC. Chúng tôi rất vui mừng được đồng hành cùng bạn trên hành trình trải nghiệm hệ thống tàu điện hiện đại, an toàn và thân thiện với môi trường.</p>
        <p>Bạn có thể đăng nhập và khám phá các tính năng tiện ích ngay hôm nay!</p>
        <div style='text-align:center;margin:32px 0;'>
            <a href='{Login}' style='display:inline-block;background:#1e40af;color:#fff;padding:14px 32px;text-decoration:none;font-size:16px;font-weight:600;border-radius:6px;'>Đăng nhập ngay</a>
        </div>
        <p>Nếu bạn có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi qua email hoặc hotline bên dưới.</p>
        <hr style='margin:32px 0;border:none;border-top:1px solid #e5e7eb;'/>
        <p style='font-size:14px;color:#6b7280;text-align:center;'>Chúc bạn một ngày tốt lành!<br/>Metro HCMC Team</p>
    </div>
</body>
</html>`}> <Input.TextArea rows={8} /> </Form.Item>
          <Form.Item name="senderName" label="Tên Người Gửi" initialValue={SENDER_OPTIONS[0]}> 
            <Select>
              {SENDER_OPTIONS.map(opt => <Select.Option key={opt} value={opt}>{opt}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="category" label="Danh Mục" initialValue="Welcome"> <Input /> </Form.Item>
          <Form.Item name="preHeaderText" label="Pre-header Text" initialValue="Chào mừng bạn đến với Metro HCMC!"> <Input /> </Form.Item>
          <Form.Item name="personalizationTags" label="Personalization Tags" initialValue="{userName}, {Login}"> <Input /> </Form.Item>
          <Form.Item name="footerContent" label="Footer" initialValue={FOOTER_OPTIONS[0]}> 
            <Select>
              {FOOTER_OPTIONS.map(opt => <Select.Option key={opt} value={opt}>{opt}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="callToAction" label="Call To Action" initialValue="Đăng nhập ngay"> <Input /> </Form.Item>
          <Form.Item name="language" label="Ngôn Ngữ" initialValue={LANGUAGE_OPTIONS[0]}> 
            <Select>
              {LANGUAGE_OPTIONS.map(opt => <Select.Option key={opt} value={opt}>{opt}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="recipientType" label="Loại Người Nhận" initialValue="CUSTOMER"> <Input /> </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo Template
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Modal
        open={previewVisible}
        title="Xem trước Email Template"
        onCancel={() => setPreviewVisible(false)}
        onOk={handleConfirm}
        okText="Xác nhận tạo"
        cancelText="Hủy"
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
    </div>
  );
};

export default CreateEmailTemplate;
