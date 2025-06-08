import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Space,
  Typography,
  Select,
  Spin,
  Row,
  Col,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { TicketApi } from '../../../../api/ticket/TicketApi';
import type { CreateSubscriptionDTO } from '../../../../api/ticket/TicketInterface';
import { 
  SubscriptionTicketType,
  TICKET_TYPE_CONFIG 
} from '../../../../api/ticket/TicketInterface';

const { Title } = Typography;
const { Option } = Select;

const CreateSubscriptionTicket: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: CreateSubscriptionDTO) => {
    try {
      setLoading(true);
      const response = await TicketApi.createSubscription(values);

      if (response.isSuccess) {
        message.success('Tạo vé đăng ký thành công');
        navigate('/manager/tickets');
      } else {
        message.error(response.message || 'Không thể tạo vé đăng ký');
      }
    } catch (error) {
      console.error('Error creating subscription ticket:', error);
      message.error('Có lỗi xảy ra khi tạo vé đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketTypeChange = (value: SubscriptionTicketType) => {
    // Reset form when ticket type changes
    form.setFieldsValue({
      price: undefined
    });
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/manager/subscription-ticket')}
        >
          Quay lại danh sách vé
        </Button>
        <Title level={2} style={{ margin: 0 }}>Tạo Vé Đăng Ký Mới</Title>
      </Space>

      <Card>
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={loading}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="ticketName"
                  label="Tên Vé"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên vé' },
                    { max: 100, message: 'Tên vé không được vượt quá 100 ký tự' }
                  ]}
                >
                  <Input placeholder="Nhập tên vé" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="ticketType"
                  label="Loại Vé"
                  rules={[{ required: true, message: 'Vui lòng chọn loại vé' }]}
                >
                  <Select 
                    placeholder="Chọn loại vé"
                    onChange={handleTicketTypeChange}
                  >
                    {Object.entries(TICKET_TYPE_CONFIG).map(([type, config]) => (
                      <Option key={type} value={type}>
                        {config.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="price"
                  label="Giá Vé (VND)"
                  rules={[
                    { required: true, message: 'Vui lòng nhập giá vé' },
                    { type: 'number', min: 0, message: 'Giá vé phải lớn hơn 0' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Nhập giá vé"
                    min={0}
                    addonBefore="₫"
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => 
                    prevValues.ticketType !== currentValues.ticketType
                  }
                >
                  {({ getFieldValue }) => {
                    const ticketType = getFieldValue('ticketType') as SubscriptionTicketType;
                    const config = ticketType ? TICKET_TYPE_CONFIG[ticketType] : null;
                    
                    return config ? (
                      <div style={{ marginBottom: 24 }}>
                        <Typography.Text type="secondary">
                          {config.description}
                        </Typography.Text>
                      </div>
                    ) : null;
                  }}
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Tạo Vé
                </Button>
                <Button onClick={() => navigate('/manager/subscription-ticket')}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </Space>
  );
};

export default CreateSubscriptionTicket;
