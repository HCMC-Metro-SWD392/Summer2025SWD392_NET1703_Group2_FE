import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  message,
  notification,
} from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import logoMetro from "../../../../assets/logo.png";
import backgroundHcmCity from "../../../../assets/backgroundhcmcity.png";
import type { LoginByGooglePayload, LoginPayload } from "../../../../../types/types";
import { login, LoginByGoogle } from "../../../../../api/auth/auth";
import { startSignalR } from "../../../../../settings/signalrConnection";

const { Title } = Typography;

interface GoogleJwtPayload {
  email: string;
  name: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: LoginPayload) => {
    setLoading(true);
    try {
      const data = await login(values);
      message.success("Đăng nhập thành công!");
      const token = localStorage.getItem("accessToken");
      await startSignalR();

      if (!token) {
        message.error("Không tìm thấy token.");
        return;
      }

      const decoded: any = jwtDecode(token);
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      switch (role) {
        case "CUSTOMER":
          navigate("/");
          break;
        case "STAFF":
          navigate("/staff");
          break;
        case "MANAGER":
          navigate("/manager");
          break;
        case "ADMIN":
          navigate("/admin");
          break;
        default:
          navigate("/");
      }
      // message.success("Đăng nhập thành công!");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      notification.error({
        message: "Lỗi",
        description: errorMessage,
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishByGoogle = async (values: LoginByGooglePayload) => {
    setLoading(true);
    try {
      const data = await LoginByGoogle(values);
      message.success("Đăng nhập thành công!");
      const token = localStorage.getItem("accessToken");

      if (!token) {
        message.error("Không tìm thấy token.");
        return;
      }

      const decoded: any = jwtDecode(token);
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      switch (role) {
        case "CUSTOMER":
          navigate("/");
          break;
        case "STAFF":
          navigate("/staff");
          break;
        case "MANAGER":
          navigate("/manager");
          break;
        case "ADMIN":
          navigate("/admin");
          break;
        default:
          navigate("/");
      }
      // message.success("Đăng nhập thành công!");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      notification.error({
        message: "Lỗi",
        description: errorMessage,
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4"
      style={{
        backgroundImage: `url(${backgroundHcmCity})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img src={logoMetro} alt="Logo" className="w-35" />
          </div>
          <Title level={2} className="font-bold mb-2">
            Đăng nhập
          </Title>
          <p className="text-gray-500">
            Vui lòng nhập thông tin tài khoản để đăng nhập.
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập email"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item style={{ margin: 4 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="rounded-full"
              size="large"
              loading={loading}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div className="flex justify-between text-sm mt-2 mb-4">
          <div></div>
          <span
            className="text-blue-600 font-medium cursor-pointer"
            onClick={() => navigate("/forgot-password")}
          >
            Quên Mật Khẩu?
          </span>
        </div>

        <div className="text-center text-sm mt-4">
          Chưa có tài khoản?{" "}
          <span
            className="text-blue-600 font-medium cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Đăng ký ngay
          </span>
        </div>

        <div className="mt-1 flex flex-col items-center">
          <p className="text-gray-500 text-sm mb-2">Hoặc đăng nhập bằng</p>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  const user = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);
                  console.log("Google user info:", user);

                  const loginData: LoginByGooglePayload = {
                    email: user.email,
                    fullName: user.name,
                    rememberMe: true,
                  };
                  onFinishByGoogle(loginData);
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

export default LoginForm;
