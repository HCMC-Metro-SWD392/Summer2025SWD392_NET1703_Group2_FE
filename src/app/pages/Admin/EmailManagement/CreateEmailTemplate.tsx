import React, { useState } from 'react';
import { Form, Input, Button, Select, Modal, message, Typography } from 'antd';
import axiosInstance from '../../../../settings/axiosInstance';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Paragraph } = Typography;

// Footer thực tế lấy từ UpdateEmailTemplate và Footer trang web
const footerOptions = [
  {
    label: '© 2025 Metro HCMC. Tất cả quyền được bảo lưu. Email: support@metrohcmc.xyz | Hotline: 1900-6060',
    value: '© 2025 Metro HCMC. Tất cả quyền được bảo lưu. Email: support@metrohcmc.xyz | Hotline: 1900-6060',
  },
  {
    label: '© 2025 Metro HCMC. All rights reserved. Email: support@metrohcmc.xyz | Hotline: 1900-6060',
    value: '© 2025 Metro HCMC. All rights reserved. Email: support@metrohcmc.xyz | Hotline: 1900-6060',
  },
  {
    label: 'Depot Long Bình, Phường Long Bình, Thành phố Thủ Đức, TP.HCM',
    value: 'Depot Long Bình, Phường Long Bình, Thành phố Thủ Đức, TP.HCM',
  },
  {
    label: 'Điện thoại: 02873003885',
    value: 'Điện thoại: 02873003885',
  },
  {
    label: 'Mã số thuế: 0315818455',
    value: 'Mã số thuế: 0315818455',
  },
  {
    label: 'Theo Quyết định số 5368 ngày 15/11/2023 của UBND Thành phố Hồ Chí Minh',
    value: 'Theo Quyết định số 5368 ngày 15/11/2023 của UBND Thành phố Hồ Chí Minh',
  },
];

// Ngôn ngữ tiếng Việt
const languageOptions = [
  { label: 'Tiếng Việt', value: 'Vietnamese' },
  { label: 'Tiếng Anh', value: 'English' },
];

// Bộ data mẫu cho template thông báo mua vé thành công
export const sampleTicketSuccessTemplate = {
  templateName: 'Thông báo mua vé thành công',
  subjectLine: 'Bạn đã mua vé thành công!',
  bodyContent: `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2 style="color: #00529b;">Cảm ơn bạn đã mua vé Metro HCMC!</h2>
      <p>Xin chào <b>{customerName}</b>,</p>
      <p>Bạn đã mua vé thành công cho tuyến <b>{routeName}</b> từ <b>{fromStation}</b> đến <b>{toStation}</b>.</p>
      <ul>
        <li><b>Mã vé:</b> {ticketCode}</li>
        <li><b>Thời gian sử dụng:</b> {validTime}</li>
        <li><b>Giá vé:</b> {ticketPrice} VNĐ</li>
      </ul>
      <p>Vui lòng xuất trình mã QR khi lên tàu.</p>
      <p>Chúc bạn có một chuyến đi an toàn và thuận lợi!</p>
    </div>
  `,
  senderName: 'Metro HCMC',
  category: 'Thông báo',
  preHeaderText: 'Bạn đã mua vé thành công trên hệ thống Metro HCMC',
  personalizationTags: '{customerName}, {routeName}, {fromStation}, {toStation}, {ticketCode}, {validTime}, {ticketPrice}',
  footerContent: '© 2025 Metro HCMC. Tất cả quyền được bảo lưu. Email: support@metrohcmc.xyz | Hotline: 1900-6060',
  callToAction: 'Xem vé của bạn',
  language: 'Vietnamese',
  recipientType: 'Customer',
};

const recipientTypeOptions = [
  { label: 'Customer', value: 'Customer' },
  { label: 'Staff', value: 'Staff' },
  { label: 'Manager', value: 'Manager' },
  { label: 'Admin', value: 'Admin' },
];
const senderNameOptions = [
  { label: 'Metro HCMC', value: 'Metro HCMC' },
  { label: 'Support', value: 'Support' },
  { label: 'Admin', value: 'Admin' },
];

const initialForm = {
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
  recipientType: '',
};

const CreateEmailTemplate: React.FC = () => {
  const [formData, setFormData] = useState(initialForm);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreview = () => {
    setPreviewVisible(true);
  };

  const handleCancelPreview = () => {
    setPreviewVisible(false);
  };

  const handleConfirmCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post('/api/Email/create-eamil-template', formData);
      message.success('Tạo email template thành công!');
      setPreviewVisible(false);
      navigate('/admin/email-template');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <Title level={2}>Tạo Email Template</Title>
      <Form layout="vertical">
        <Form.Item label="Tên Template" name="templateName">
          <Input
            value={formData.templateName}
            onChange={e => handleChange('templateName', e.target.value)}
            placeholder="Nhập tên template"
          />
        </Form.Item>
        <Form.Item label="Tiêu đề Email" name="subjectLine">
          <Input
            value={formData.subjectLine}
            onChange={e => handleChange('subjectLine', e.target.value)}
            placeholder="Nhập tiêu đề email"
          />
        </Form.Item>
        <Form.Item label="Nội dung Email (HTML)" name="bodyContent">
          <TextArea
            value={formData.bodyContent}
            onChange={e => handleChange('bodyContent', e.target.value)}
            placeholder="Nhập nội dung HTML cho email"
            autoSize={{ minRows: 6, maxRows: 16 }}
          />
        </Form.Item>
        <Form.Item label="Người gửi" name="senderName">
          <Select
            value={formData.senderName}
            onChange={value => handleChange('senderName', value)}
            placeholder="Chọn người gửi"
            allowClear
          >
            {senderNameOptions.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Danh mục" name="category">
          <Input
            value={formData.category}
            onChange={e => handleChange('category', e.target.value)}
            placeholder="Nhập danh mục"
          />
        </Form.Item>
        <Form.Item label="Pre-header Text" name="preHeaderText">
          <Input
            value={formData.preHeaderText}
            onChange={e => handleChange('preHeaderText', e.target.value)}
            placeholder="Nhập pre-header text"
          />
        </Form.Item>
        <Form.Item label="Personalization Tags" name="personalizationTags">
          <Input
            value={formData.personalizationTags}
            onChange={e => handleChange('personalizationTags', e.target.value)}
            placeholder="Nhập personalization tags"
          />
        </Form.Item>
        <Form.Item label="Footer" name="footerContent">
          <Select
            value={formData.footerContent}
            onChange={value => handleChange('footerContent', value)}
            placeholder="Chọn footer"
            allowClear
          >
            {footerOptions.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Call To Action" name="callToAction">
          <Input
            value={formData.callToAction}
            onChange={e => handleChange('callToAction', e.target.value)}
            placeholder="Nhập call to action"
          />
        </Form.Item>
        <Form.Item label="Ngôn ngữ" name="language">
          <Select
            value={formData.language}
            onChange={value => handleChange('language', value)}
            placeholder="Chọn ngôn ngữ"
            allowClear
          >
            {languageOptions.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Loại người nhận" name="recipientType">
          <Select
            value={formData.recipientType}
            onChange={value => handleChange('recipientType', value)}
            placeholder="Chọn loại người nhận"
            allowClear
          >
            {recipientTypeOptions.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        </Form.Item>
        {error && <Paragraph type="danger">{error}</Paragraph>}
        <Form.Item>
          <Button type="primary" onClick={handlePreview} style={{ minWidth: 120 }}>
            Xem trước & Tạo
          </Button>
        </Form.Item>
      </Form>
      <Modal
        title="Xem trước Email Template"
        open={previewVisible}
        onCancel={handleCancelPreview}
        onOk={handleConfirmCreate}
        okText="Xác nhận tạo"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <p><b>Tên Template:</b> {formData.templateName}</p>
          <p><b>Tiêu đề Email:</b> {formData.subjectLine}</p>
          <p><b>Người gửi:</b> {formData.senderName}</p>
          <p><b>Danh mục:</b> {formData.category}</p>
          <p><b>Pre-header Text:</b> {formData.preHeaderText}</p>
          <p><b>Personalization Tags:</b> {formData.personalizationTags}</p>
          <p><b>Footer:</b> {formData.footerContent}</p>
          <p><b>Call To Action:</b> {formData.callToAction}</p>
          <p><b>Ngôn ngữ:</b> {formData.language}</p>
          <p><b>Loại người nhận:</b> {formData.recipientType}</p>
          <div style={{ margin: '16px 0' }}>
            <b>Nội dung Email (HTML):</b>
            <div style={{ border: '1px solid #eee', padding: 8, marginTop: 4 }}>
              <div dangerouslySetInnerHTML={{ __html: formData.bodyContent || '<i>Không có nội dung</i>' }} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateEmailTemplate;
