import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100 px-4">
      <Result
        status="403"
        title="403 - Không có quyền truy cập"
        subTitle="Bạn không được phép truy cập trang này. Vui lòng đăng nhập với tài khoản phù hợp hoặc quay lại trang trước."
        extra={
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button type="primary" onClick={() => navigate("/")}>
              Về trang chủ
            </Button>
            <Button onClick={() => navigate(-1)}>Quay lại</Button>
          </div>
        }
      />
    </div>
  );
};

export default UnauthorizedPage;
