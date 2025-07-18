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
  Tabs,
  Select,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserAddOutlined,
  InfoCircleOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  CrownOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { RoleApi } from '../../../../api/auth/role';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface SetRoleForm {
  email: string;
  role: 'admin' | 'manager';
}

interface ManualRoleForm {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'manager';
}

const SetRole: React.FC = () => {
  const [formEmail] = Form.useForm();
  const [formManual] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmitEmail = async (values: SetRoleForm) => {
    try {
      setLoading(true);
      let response;
      if (values.role === 'admin') {
        response = await RoleApi.setAdminRole(values.email);
      } else {
        response = await RoleApi.setManagerRole(values.email);
      }
      if (response.isSuccess) {
        message.success(`Gán vai trò ${values.role === 'admin' ? 'admin' : 'manager'} thành công!`);
        formEmail.resetFields();
        navigate('/admin/set-role');
      } else {
        message.error(response.message || 'Gán vai trò thất bại!');
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi gán vai trò!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitManual = async (values: ManualRoleForm) => {
    try {
      setLoading(true);
      if (values.password !== values.confirmPassword) {
        message.error('Mật khẩu và xác nhận mật khẩu không khớp!');
        return;
      }
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])/;
      if (!passwordRegex.test(values.password)) {
        message.error('Mật khẩu phải có ít nhất 1 chữ viết hoa và 1 ký tự đặc biệt.');
        return;
      }
      const { role, ...payload } = values;
      let response;
      if (role === 'admin') {
        response = await RoleApi.createAdmin(payload);
      } else {
        response = await RoleApi.createManager(payload);
      }
      if (response.isSuccess) {
        message.success(`Tạo tài khoản ${role === 'admin' ? 'admin' : 'manager'} thành công!`);
        formManual.resetFields();
      } else {
        message.error(response.message || 'Tạo tài khoản thất bại!');
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tạo tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space>
        <Title level={2} style={{ margin: 0 }}>
          <CrownOutlined style={{ marginRight: '8px' }} />
          Tạo hoặc gán vai trò Admin/Manager
        </Title>
      </Space>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card>
            <Spin spinning={loading}>
              <Tabs defaultActiveKey="1" size="large">
                <TabPane tab="🔗 Gán vai trò bằng Email" key="1">
                  <Form
                    form={formEmail}
                    layout="vertical"
                    onFinish={handleSubmitEmail}
                    disabled={loading}
                    size="large"
                  >
                    <Form.Item
                      name="role"
                      label="Chọn vai trò"
                      rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                    >
                      <Select placeholder="Chọn vai trò">
                        <Option value="admin">Admin</Option>
                        <Option value="manager">Manager</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="email"
                      label="Email người dùng"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' },
                      ]}
                    >
                      <Input prefix={<MailOutlined />} placeholder="email@domain.com" />
                    </Form.Item>
                    <Form.Item>
                      <Space>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<UserAddOutlined />}
                          loading={loading}
                          size="large"
                        >
                          Gán vai trò
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </TabPane>

                <TabPane tab="✍️ Tạo tài khoản thủ công" key="2">
                  <Form
                    form={formManual}
                    layout="vertical"
                    onFinish={handleSubmitManual}
                    disabled={loading}
                    size="large"
                  >
                    <Form.Item
                      name="role"
                      label="Chọn vai trò"
                      rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                    >
                      <Select placeholder="Chọn vai trò">
                        <Option value="admin">Admin</Option>
                        <Option value="manager">Manager</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="fullName"
                      label="Họ và tên"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                    </Form.Item>
                    <Form.Item
                      name="phoneNumber"
                      label="Số điện thoại"
                      rules={[{ required: false, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="0123456789" />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' },
                      ]}
                    >
                      <Input prefix={<MailOutlined />} placeholder="email@domain.com" />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      label="Mật khẩu"
                      rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu' },
                        {
                          pattern: /^(?=.*[A-Z])(?=.*[!@#$%^&*])/, // At least 1 uppercase and 1 special char
                          message: 'Ít nhất 1 chữ hoa & 1 ký tự đặc biệt',
                        },
                        { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' },
                      ]}
                      hasFeedback
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                    </Form.Item>
                    <Form.Item
                      name="confirmPassword"
                      label="Xác nhận mật khẩu"
                      dependencies={['password']}
                      hasFeedback
                      rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
                    </Form.Item>
                    <Form.Item>
                      <Space>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<UserAddOutlined />}
                          loading={loading}
                          size="large"
                        >
                          Tạo tài khoản
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </TabPane>

                <TabPane tab="⬇️ Hạ vai trò về User" key="3">
                  <Form
                    layout="vertical"
                    onFinish={async (values) => {
                      try {
                        setLoading(true);
                        const response = await RoleApi.demoteRoleToUser(values.email);
                        if (response.isSuccess) {
                          message.success('Hạ vai trò về User thành công!');
                        } else {
                          message.error(response.message || 'Hạ vai trò thất bại!');
                        }
                      } catch (error: any) {
                        message.error(error.message || 'Lỗi khi hạ vai trò!');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    size="large"
                  >
                    <Form.Item
                      name="email"
                      label="Email người dùng"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' },
                      ]}
                    >
                      <Input prefix={<MailOutlined />} placeholder="email@domain.com" />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<TeamOutlined />}
                        loading={loading}
                        size="large"
                      >
                        Hạ vai trò về User
                      </Button>
                    </Form.Item>
                  </Form>
                </TabPane>
              </Tabs>
            </Spin>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card>
            <Title level={4}>
              <InfoCircleOutlined style={{ marginRight: '8px' }} />
              Hướng dẫn
            </Title>
            <Divider />
            <Space direction="vertical" size="middle">
              <Alert
                message="Gán bằng Email"
                description={
                  <ul style={{ margin: 0 }}>
                    <li>- Người dùng đã có tài khoản</li>
                    <li>- Email hợp lệ và đã xác thực</li>
                    <li>- Chưa có quyền admin/manager</li>
                  </ul>
                }
                type="info"
                showIcon
              />
              <Alert
                message="Tạo tài khoản thủ công"
                description={
                  <ul style={{ margin: 0 }}>
                    <li>- Nhập đầy đủ: họ tên, email, mật khẩu</li>
                    <li>- Mật khẩu mạnh: ≥ 8 ký tự, 1 chữ hoa & 1 ký tự đặc biệt</li>
                    <li>- Chọn đúng vai trò muốn tạo</li>
                  </ul>
                }
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

export default SetRole;
