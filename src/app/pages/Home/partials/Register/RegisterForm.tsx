import React from "react";
import { Form, Input, Button, Typography, Checkbox, message, notification } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import logoMetro from "../../../../assets/logo.png";
import backgroundHcmCity from "../../../../assets/backgroundhcmcity.png";

import type { RegisterPayload } from "../../../../../types/types";
import { register } from "../../../../../api/auth/auth";

const { Title } = Typography;

const RegisterForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    const fullName = `${values.firstName} ${values.lastName}`;
    const submitData: RegisterPayload = { ...values, fullName };

    try {
      const res = await register(submitData);
      notification.success({
        message: "Thành công",
        description: res?.data?.message,
        placement: "topRight",
      });
      navigate("/login");
    } catch (error: any) {
      const errors = error.response?.data?.errors;

      if (errors && typeof errors === "object") {
        Object.entries(errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => {
              notification.error({
                message: `Lỗi ${field}`,
                description: msg,
                placement: "topRight",
              });
            });
          }
        });
      } else {
        const errMsg = error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại";
        notification.error({
          message: "Lỗi",
          description: errMsg,
          placement: "topRight",
        });
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-white px-4" style={{
      backgroundImage: `url(${backgroundHcmCity})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl px-8 py-5">
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

            <Form.Item style={{ margin: 1 }} name="phoneNumber" label="Số điện thoại" className="w-full">
              <Input placeholder="Nhập số điện thoại (không bắt buộc)" />
            </Form.Item>
          </div>

          <div className="flex gap-4">
            <Form.Item
              style={{ margin: 1 }}
              name="password"
              label="Mật khẩu"
              className="w-full"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                {
                  pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
                  message:
                    "Mật khẩu yêu cầu phải có ít nhất 1 ký tự đặc biệt, 1 chữ cái in hoa, 1 chữ số và tối thiểu 8 ký tự",
                },
              ]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item style={{ margin: 1 }}
              name="confirmPassword"
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

          <Form.Item style={{ margin: 5 }}>
            <Button type="primary" htmlType="submit" block className="rounded-full">
              Tạo tài khoản
            </Button>
          </Form.Item>


        </Form>

        <div className="text-center text-sm mt-2">
          Đã có tài khoản?{" "}
          <span
            className="text-blue-600 font-medium cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </span>
        </div>

        <div className="mt-2 flex flex-col items-center">
          <p className="text-gray-500 text-sm mb-2">Hoặc đăng nhập bằng</p>
          <div className="flex justify-center mb-3">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  const user = jwtDecode(credentialResponse.credential);
                  console.log("Google user info:", user);
                  message.success("Đăng nhập Google thành công!");
                }
              }}
              onError={() => {
                message.error("Đăng nhập Google thất bại");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
