import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const SubmitSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f0f8ff] flex items-center justify-center p-4">
      <Result
        status="success"
        title="Nộp đơn thành công!"
        subTitle="Chúng tôi đã nhận được đơn của bạn và sẽ xử lý trong thời gian sớm nhất."
        extra={[
          <Button
            type="primary"
            key="home"
            onClick={() => navigate("/")}
          >
            Quay về trang chủ
          </Button>,
          <Button
            key="my-requests"
            onClick={() => navigate("/services/mySubmittedRequest")}
          >
            Xem đơn đã nộp
          </Button>,
        ]}
      />
    </div>
  );
};

export default SubmitSuccess;
