import React, { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import logoMetro from '../../../../assets/logo.png';
import backgroundHcmCity from '../../../../assets/backgroundhcmcity.png';
import { changePassword } from '../../../../../api/auth/auth';

const { Title } = Typography;

const ResetPasswordForm: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      // Giả sử có token hoặc mã xác thực từ link, cần truyền kèm nếu API yêu cầu
      const response = await changePassword({
        currentPassword: '', // Không có currentPassword khi reset qua email
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      if (response?.isSuccess) {
        message.success('Đổi mật khẩu thành công!');
      } else {
        message.error(response?.message || 'Đổi mật khẩu thất bại.');
      }
    } catch (error: any) {
      message.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4"
      style={{
        backgroundImage: `url(${backgroundHcmCity})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img src={logoMetro} alt="Logo" className="w-35" />
          </div>
          <Title level={2} className="font-bold mb-2">
            Đặt Lại Mật Khẩu
          </Title>
          <p className="text-gray-500">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>
        <Form
          name="reset_password_form"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              {
                pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
                message: 'Mật khẩu phải có ít nhất 8 ký tự, 1 ký tự hoa, 1 số và 1 ký tự đặc biệt',
              },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Nhập mật khẩu mới" className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" className="rounded-md" />
          </Form.Item>
          <Form.Item style={{ margin: 4 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="rounded-full"
              loading={loading}
              size="large"
            >
              Đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
