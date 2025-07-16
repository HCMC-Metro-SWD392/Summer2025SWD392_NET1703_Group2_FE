import React, { useState } from 'react';
import { Input, Button, message, Form, Typography } from 'antd';
import { resetPassword } from '../../../../../api/auth/auth';
import logoMetro from '../../../../assets/logo.png';
import backgroundHcmCity from '../../../../assets/backgroundhcmcity.png';

const { Title } = Typography;

const EmailForm: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await resetPassword(values.email);
      if (response?.isSuccess) {
        message.success('Vui lòng check mail để đổi mật khẩu');
      } else {
        message.error('Email không đúng, vui lòng thử lại.');
      }
    } catch (error) {
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
            Quên Mật Khẩu
          </Title>
          <p className="text-gray-500">
            Nhập email tài khoản để nhận hướng dẫn đặt lại mật khẩu.
          </p>
        </div>
        <Form
          name="email_reset_form"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input placeholder="Nhập email của bạn" className="rounded-md" />
          </Form.Item>
          <Form.Item style={{ margin: 4 }}>
            <Button type="primary" htmlType="submit" loading={loading} block className="rounded-full" size="large">
              Gửi yêu cầu đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default EmailForm;
