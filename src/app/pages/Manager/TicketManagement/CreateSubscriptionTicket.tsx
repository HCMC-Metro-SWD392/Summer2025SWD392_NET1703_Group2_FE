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

const { Title } = Typography;
const { Option } = Select;

// Enum for ticket types
enum SubscriptionTicketType {
  OneWay = 'OneWay',
  Monthly = 'Monthly',
  Student = 'Student'
}

interface SubscriptionTicket {
  id: string;
  ticketName: string;
  ticketType: SubscriptionTicketType;
  price: number;
  expiration: number;
}

const CreateSubscriptionTicket: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketName: values.ticketName,
          ticketType: values.ticketType,
          price: values.price,
          expiration: values.expiration,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription ticket');
      }

      message.success('Subscription ticket created successfully');
      navigate('/manager/tickets');
    } catch (error) {
      message.error('Failed to create subscription ticket');
    } finally {
      setLoading(false);
    }
  };

  const getExpirationLabel = (type: SubscriptionTicketType) => {
    switch (type) {
      case SubscriptionTicketType.OneWay:
        return 'Days';
      case SubscriptionTicketType.Monthly:
        return 'Months';
      case SubscriptionTicketType.Student:
        return 'Years';
      default:
        return 'Units';
    }
  };

  const handleTicketTypeChange = (value: SubscriptionTicketType) => {
    // Reset expiration when ticket type changes
    form.setFieldValue('expiration', undefined);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/manager/tickets')}
        >
          Back to Ticket List
        </Button>
        <Title level={2} style={{ margin: 0 }}>Create Subscription Ticket</Title>
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
                  label="Ticket Name"
                  rules={[
                    { required: true, message: 'Please enter ticket name' },
                    { max: 100, message: 'Ticket name cannot exceed 100 characters' }
                  ]}
                >
                  <Input placeholder="Enter ticket name" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="ticketType"
                  label="Ticket Type"
                  rules={[{ required: true, message: 'Please select ticket type' }]}
                >
                  <Select 
                    placeholder="Select ticket type"
                    onChange={handleTicketTypeChange}
                  >
                    <Option value={SubscriptionTicketType.OneWay}>OneWay</Option>
                    <Option value={SubscriptionTicketType.Monthly}>Monthly</Option>
                    <Option value={SubscriptionTicketType.Student}>Student</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="price"
                  label="Price (VND)"
                  rules={[
                    { required: true, message: 'Please enter price' },
                    { type: 'number', min: 0, message: 'Price must be greater than 0' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Enter price"
                    min={0}
                    addonBefore="₫"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="expiration"
                  label="Expiration"
                  rules={[
                    { required: true, message: 'Please enter expiration period' },
                    { type: 'number', min: 1, message: 'Expiration must be at least 1' }
                  ]}
                  dependencies={['ticketType']}
                >
                  {({ getFieldValue }) => {
                    const ticketType = getFieldValue('ticketType');
                    const label = ticketType ? getExpirationLabel(ticketType) : 'Units';
                    
                    return (
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder={`Enter number of ${label.toLowerCase()}`}
                        min={1}
                        addonAfter={label}
                      />
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Create Ticket
                </Button>
                <Button onClick={() => navigate('/manager/tickets')}>
                  Cancel
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
