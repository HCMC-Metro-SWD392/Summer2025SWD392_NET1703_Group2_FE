import React from "react";
import { Form, Input, Button, Typography, Checkbox } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import logoMetro from "../../assets/logo.png";
import backgroundHcmCity from "../../assets/backgroundhcmcity.png";

const { Title } = Typography;

const RegisterForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    const fullName = `${values.lastName} ${values.firstName}`;
    const submitData = { ...values, fullName };
    console.log("Dữ liệu đăng ký:", submitData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4" style={{
    backgroundImage: `url(${backgroundHcmCity})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}>
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-4">
          <img src={logoMetro} alt="Logo" className="w-35" />
        </div>

        <Title level={2} className="text-center font-bold mb-2">Đăng ký</Title>
        <p className="text-center text-gray-500 mb-6">
          Hãy bắt đầu tạo tài khoản cá nhân của bạn.
        </p>

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <div className="flex gap-4">
            <Form.Item style={{ margin: 1 }}
              name="firstName"
              label="Họ"
              className="w-full"
              rules={[{ required: true, message: "Vui lòng nhập họ của bạn" }]}
            >
              <Input placeholder="Nhập họ" />
            </Form.Item>

            <Form.Item style={{ margin: 1 }}
              name="lastName"
              label="Tên"
              className="w-full"
              rules={[{ required: true, message: "Vui lòng nhập tên của bạn" }]}
            >
              <Input placeholder="Nhập tên" />
            </Form.Item>
          </div>

          <div className="flex gap-4">
            <Form.Item style={{ margin: 1 }}
              name="email"
              label="Email"
              className="w-full"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập email" />
            </Form.Item>

            <Form.Item style={{ margin: 1 }} name="phone" label="Số điện thoại" className="w-full">
              <Input placeholder="Nhập số điện thoại (không bắt buộc)" />
            </Form.Item>
          </div>

          <div className="flex gap-4">
            <Form.Item style={{ margin: 1 }}
              name="password"
              label="Mật khẩu"
              className="w-full"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item style={{ margin: 1 }}
              name="confirm"
              label="Xác nhận mật khẩu"
              className="w-full"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
            </Form.Item>
          </div>

          <Form.Item style={{ margin: 1 }}
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error("Bạn cần đồng ý với Điều khoản sử dụng")),
              },
            ]}
          >
            <Checkbox>
              Tôi đồng ý với{" "}
              <span className="text-blue-500 cursor-pointer">Điều khoản</span> và{" "}
              <span className="text-blue-500 cursor-pointer">Chính sách bảo mật</span>
            </Checkbox>
          </Form.Item>

          <Form.Item style={{ margin: 1 }}>
            <Button type="primary" htmlType="submit" block className="rounded-full">
              Tạo tài khoản
            </Button>
          </Form.Item>

          <div className="text-center text-sm">
            Đã có tài khoản?{" "}
            <span
              className="text-blue-600 font-medium cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Đăng nhập
            </span>
          </div>
        </Form>

        <div className="mt-3 flex flex-col items-center">
          <p className="text-gray-500 text-sm mb-2">Hoặc đăng ký bằng</p>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  console.log(jwtDecode(credentialResponse.credential));
                }
              }}
              onError={() => console.log("Đăng nhập Google thất bại")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
