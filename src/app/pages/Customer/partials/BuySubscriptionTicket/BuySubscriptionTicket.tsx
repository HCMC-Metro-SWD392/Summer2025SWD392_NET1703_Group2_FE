import React, { useState } from "react";
import { Typography, Button, message } from "antd";
import { IdcardOutlined } from "@ant-design/icons";
import logoMetro from "../../../../assets/logo.png";

const { Title, Text } = Typography;

const ticketOptions = [
    {
        id: "daily",
        name: "Vé Ngày",
        duration: 1,
        price: 20000,
    },
    {
        id: "weekly",
        name: "Vé Tuần",
        duration: 7,
        price: 100000,
    },
    {
        id: "monthly",
        name: "Vé Tháng",
        duration: 30,
        price: 300000,
    },
    {
        id: "student",
        name: "Vé Ưu Tiên (HSSV)",
        duration: 30,
        price: 150000,
        note: "Yêu cầu thẻ sinh viên / học sinh khi sử dụng",
    },
    {
        id: "yearly",
        name: "Vé Năm",
        duration: 365,
        price: 500000,
    },
];

const BuySubscriptionTicket: React.FC = () => {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleBuy = (ticket: (typeof ticketOptions)[0]) => {
        setLoadingId(ticket.id);
        setTimeout(() => {
            setLoadingId(null);
            message.success(`Đặt mua ${ticket.name} thành công!`);
        }, 1000);
    };

    return (
        <div className="bg-[#f9fafb] min-h-screen py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-center mb-6">
                    <img src={logoMetro} alt="Metro Logo" className="h-10" />
                </div>

                <Title level={3} className="text-center mb-10 text-blue-700">
                    Mua Vé Định Kỳ Metro
                </Title>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ticketOptions.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
                        >
                            {/* Icon */}
                            <div className="text-3xl text-center mb-3 text-gray-600">
                                <IdcardOutlined />
                            </div>

                            {/* Nội dung chính */}
                            <div className="flex-grow flex flex-col items-center text-center mb-4">
                                <Text className="text-base font-semibold text-gray-800 mb-1">
                                    {ticket.name}
                                </Text>
                                <p className="text-sm text-gray-500">{ticket.duration} ngày hiệu lực</p>
                                <p className="mt-1 text-blue-700 font-bold text-base">
                                    {ticket.price.toLocaleString()}₫
                                </p>

                                <div className="mt-4 w-full border border-dashed border-gray-400 rounded-lg p-3 text-left text-sm text-gray-700 space-y-2 min-h-[128px]">
                                    <p>
                                        <span className="mr-1">⏳</span>
                                        <strong>Hiệu lực:</strong> {ticket.duration} ngày kể từ ngày kích hoạt
                                    </p>
                                    <p>
                                        <span className="mr-1">💰</span>
                                        <strong>Giá:</strong> {ticket.price.toLocaleString()}₫
                                    </p>
                                    {ticket.note && (
                                        <p className="text-red-500 font-medium text-xs">* {ticket.note}</p>
                                    )}
                                </div>
                            </div>

                            {/* Nút mua */}
                            <Button
                                type="primary"
                                size="middle"
                                block
                                className="rounded-xl"
                                loading={loadingId === ticket.id}
                                onClick={() => handleBuy(ticket)}
                            >
                                Mua vé
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BuySubscriptionTicket;
