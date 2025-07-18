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
} from 'antd';
import {
  ArrowLeftOutlined,
  UserAddOutlined,
  InfoCircleOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ManageStaffApi } from '../../../../api/manageStaff/manageStaffApi';
import { RoleApi } from '../../../../api/auth/role';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface SetStaffRoleForm {
  email: string;
}

interface ManualStaffForm {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const CreateStaff: React.FC = () => {
  const [formEmail] = Form.useForm();
  const [formManual] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigate('/manager/staffs');
  };

  const handleSubmitEmail = async (values: SetStaffRoleForm) => {
    try {
      setLoading(true);
      const response = await ManageStaffApi.setStaffRole(values.email);
      if (response.isSuccess) {
        message.success('Gán vai trò nhân viên thành công!');
        formEmail.resetFields();
        navigate('/manager/staffs');
      } else {
        message.error(response.message || 'Gán vai trò thất bại!');
      }
    } catch (error: any) {
      console.error('Error setting staff role:', error);
      message.error(error.message || 'Lỗi khi gán vai trò!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitManual = async (values: ManualStaffForm) => {
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

      // const { confirmPassword, ...payload } = values;
      const response = await ManageStaffApi.createStaffManual(values);

      if (response.isSuccess) {
        message.success('Tạo tài khoản nhân viên thành công!');
        formManual.resetFields();
        navigate('/manager/staffs');
      } else {
        message.error(response.message || 'Tạo tài khoản thất bại!');
      }
    } catch (error: any) {
      console.error('Error creating staff:', error);
      message.error(error.message || 'Lỗi khi tạo tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Quay lại danh sách nhân viên
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          <UserAddOutlined style={{ marginRight: '8px' }} />
          Tạo hoặc gán nhân viên
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
                      name="email"
                      label="Email nhân viên"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email nhân viên' },
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
                          Gán vai trò nhân viên
                        </Button>
                        <Button onClick={handleBack} size="large">
                          Hủy
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
                          pattern: /^(?=.*[A-Z])(?=.*[!@#$%^&*])/,
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
                        <Button onClick={handleBack} size="large">
                          Hủy
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </TabPane>

                <TabPane tab="⬇️ Hạ vai trò về Người Dùng" key="3">
                  <Form
                    layout="vertical"
                    onFinish={async (values) => {
                      try {
                        setLoading(true);
                        const response = await RoleApi.demoteStaffToUser(values.email);
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
                      label="Email nhân viên"
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
                        icon={<UserAddOutlined />}
                        loading={loading}
                        size="large"
                      >
                        Hạ vai trò về Người Dùng
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
                    <li>- Chưa có quyền nhân viên</li>
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

export default CreateStaff;
