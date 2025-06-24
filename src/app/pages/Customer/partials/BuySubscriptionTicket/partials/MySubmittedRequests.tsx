// src/pages/MySubmittedRequests.tsx

import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Spin, message } from "antd";
import axiosInstance from "../../../../../../settings/axiosInstance";
import dayjs from "dayjs";

const { Title } = Typography;

interface FormRequest {
  id: string;
  senderId: string;
  title: string;
  content: string;
  formRequestType: number;
  reviewerId: string;
  rejectionReason: string | null;
  createdAt: string;
  status: number; // 0: pending, 1: approved, 2: rejected
}

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Chờ duyệt", color: "blue" },
  1: { text: "Đã duyệt", color: "green" },
  2: { text: "Từ chối", color: "red" },
};

const MySubmittedRequests: React.FC = () => {
  const [requests, setRequests] = useState<FormRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/FormRequest/get-form-request-by-user");
      setRequests(res.data.result || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách đơn:", err);
      message.error("Không thể tải đơn đã gửi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      render: (text: string) => <span className="text-gray-700">{text}</span>,
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: number) => {
        const info = statusMap[status];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: "Lý do từ chối",
      dataIndex: "rejectionReason",
      key: "rejectionReason",
      render: (_: any, record: FormRequest) =>
        record.status === 2 && record.rejectionReason ? (
          <span className="text-red-500 italic">{record.rejectionReason}</span>
        ) : (
          <span className="text-gray-400 italic">---</span>
        ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Title level={3} className="text-blue-700 text-center mb-8">
        Danh sách đơn đã gửi
      </Title>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          dataSource={requests}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 6 }}
          bordered
          className="bg-white shadow rounded-xl"
        />
      )}
    </div>
  );
};

export default MySubmittedRequests;
