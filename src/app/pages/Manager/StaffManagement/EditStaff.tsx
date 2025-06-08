import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Typography,
  DatePicker,
  Select,
  Spin,
  Row,
  Col,
} from 'antd';
import dayjs from 'dayjs';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

interface Staff {
  id: string;
  userId: string;
  user: {
    id: string;
    fullName: string | null;
    email: string;
    phoneNumber: string;
    address: string | null;
    dateOfBirth: string | null;
    sex: string | null;
    identityId: string | null;
  };
}

const EditStaff: React.FC = () => {
  const [form] = Form.useForm();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<Staff | null>(null);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/staff/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch staff data');
        }
        const data = await response.json();
        setStaff(data);
        
        // Set form values
        form.setFieldsValue({
          fullName: data.user.fullName,
          email: data.user.email,
          phoneNumber: data.user.phoneNumber,
          address: data.user.address,
          dateOfBirth: data.user.dateOfBirth ? dayjs(data.user.dateOfBirth) : null,
          sex: data.user.sex,
          identityId: data.user.identityId,
        });
      } catch (error) {
        message.error('Failed to fetch staff data');
        navigate('/manager/staff');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [id, form, navigate]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: staff?.userId,
          fullName: values.fullName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          address: values.address,
          dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
          sex: values.sex,
          identityId: values.identityId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update staff');
      }

      message.success('Staff information updated successfully');
      navigate('/manager/staff');
    } catch (error) {
      message.error('Failed to update staff information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/manager/staff')}
        >
          Back to Staff List
        </Button>
        <Title level={2} style={{ margin: 0 }}>Edit Staff Information</Title>
      </Space>

      <Card>
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={loading}
            initialValues={{
              sex: undefined,
            }}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="fullName"
                  label="Full Name"
                  rules={[
                    { required: true, message: 'Please enter full name' },
                    { max: 100, message: 'Full name cannot exceed 100 characters' }
                  ]}
                >
                  <Input placeholder="Enter full name" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="Enter email" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="phoneNumber"
                  label="Phone Number"
                  rules={[
                    { required: true, message: 'Please enter phone number' },
                    { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
                  ]}
                >
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="identityId"
                  label="Identity ID"
                  rules={[
                    { required: true, message: 'Please enter identity ID' },
                    { pattern: /^[0-9]{12}$/, message: 'Please enter a valid 12-digit identity ID' }
                  ]}
                >
                  <Input placeholder="Enter identity ID" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="dateOfBirth"
                  label="Date of Birth"
                  rules={[{ required: true, message: 'Please select date of birth' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="sex"
                  label="Sex"
                  rules={[{ required: true, message: 'Please select sex' }]}
                >
                  <Select placeholder="Select sex">
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="address"
                  label="Address"
                  rules={[
                    { required: true, message: 'Please enter address' },
                    { max: 200, message: 'Address cannot exceed 200 characters' }
                  ]}
                >
                  <Input.TextArea 
                    placeholder="Enter address" 
                    rows={3}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save Changes
                </Button>
                <Button onClick={() => navigate('/manager/staff')}>
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

export default EditStaff;
