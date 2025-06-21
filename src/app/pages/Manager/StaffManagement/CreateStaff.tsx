import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Typography,
  Spin,
  Row,
  Col,
  Alert,
  Divider,
} from 'antd';
import { ArrowLeftOutlined, UserAddOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ManageStaffApi } from '../../../../api/manageStaff/manageStaffApi';

const { Title, Text } = Typography;

interface SetStaffRoleForm {
  email: string;
}

const CreateStaff: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: SetStaffRoleForm) => {
    try {
      setLoading(true);
      
      const response = await ManageStaffApi.setStaffRole(values.email);
      
      if (response.isSuccess) {
        message.success('Tạo nhân viên thành công !');
        form.resetFields();
        navigate('/manager/staffs');
      } else {
        message.error(response.message || 'Tạo nhân viên thất bại !');
      }
    } catch (error: any) {
      console.error('Error setting staff role:', error);
      message.error(error.message || 'Lỗi khi tạo nhân viên !');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/manager/staffs');
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
        >
          Quay lại danh sách nhân viên
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          <UserAddOutlined style={{ marginRight: '8px' }} />
          Gán vai trò nhân viên
        </Title>
      </Space>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card>
            <Spin spinning={loading}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                disabled={loading}
                size="large"
              >
                <Form.Item
                  name="email"
                  label="Email nhân viên"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email nhân viên' },
                    { type: 'email', message: 'Vui lòng nhập đúng định dạng email' }
                  ]}
                >
                  <Input 
                    placeholder="Nhập email nhân viên"
                    prefix={<UserAddOutlined />}
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={<UserAddOutlined />}
                      size="large"
                    >
                      Gán vai trò nhân viên
                    </Button>
                    <Button 
                      onClick={handleBack}
                      size="large"
                    >
                      Hủy
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Spin>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Title level={4}>
              <InfoCircleOutlined style={{ marginRight: '8px' }} />
              Thông tin quan trọng
            </Title>
            <Divider />
            
            <Space direction="vertical" size="middle">
              <Alert
                message="Thông tin quan trọng"
                description={
                  <div>
                    <Text strong>Hành động này sẽ:</Text>
                    <ul style={{ marginTop: '8px', marginBottom: '0' }}>
                      <li>- Gán vai trò "Nhân viên" cho người dùng</li>
                      <li>- Cấp quyền truy cập cấp nhân viên cho người dùng</li>
                      <li>- Cho phép người dùng truy cập các tính năng cấp nhân viên</li>
                    </ul>
                  </div>
                }
                type="info"
                showIcon
              />

              <Alert
                message="Yêu cầu"
                description={
                  <div>
                    <ul style={{ margin: '0' }}>
                      <li>- Người dùng phải có tài khoản tồn tại</li>
                      <li>- Email phải được xác thực</li>
                      <li>- Người dùng không được có quyền nhân viên</li>
                    </ul>
                  </div>
                }
                type="warning"
                showIcon
              />

              <Alert
                message="Sau khi gán"
                description="Người dùng sẽ nhận được email thông báo về vai trò nhân viên mới và có thể truy cập ngay các tính năng cấp nhân viên."
                type="success"
                showIcon
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default CreateStaff;
