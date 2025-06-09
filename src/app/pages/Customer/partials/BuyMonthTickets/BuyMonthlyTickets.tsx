import React, { useState } from "react";
import {
    Card,
    Typography,
    Radio,
    Button,
    message,
} from "antd";
import logoMetro from "../../../../assets/logo.png";

const { Title, Text } = Typography;

const BuyMonthlyTickets: React.FC = () => {
    const [ticketType, setTicketType] = useState<"normal" | "discount">("normal");
    const [loading, setLoading] = useState(false);

    const ticketPrices = {
        normal: 200000,
        discount: 100000,
    };

    const handleBuy = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            message.success("Đặt mua vé tháng thành công!");
        }, 1500);
    };

    return (
        <div className="bg-[#f0f8ff]">
            <div className="max-w-xl mx-auto min-h-[calc(100vh-80px)] px-4 py-10">
                <Card className="rounded-2xl shadow-xl p-6">
                    <div className="flex justify-center mb-6">
                        <img src={logoMetro} alt="Metro Logo" className="h-8" />
                    </div>

                    <Title level={4} className="text-center mb-6">
                        Mua Vé Metro Tháng
                    </Title>

                    <div className="space-y-4">
                        <div>
                            <Text strong>Chọn loại vé:</Text>
                            <Radio.Group
                                className="mt-2 block space-y-2"
                                onChange={(e) => setTicketType(e.target.value)}
                                value={ticketType}
                            >
                                <Radio value="normal">
                                    <div>
                                        <Text strong>Vé thường</Text>
                                        <div className="text-xs text-gray-500">Dành cho mọi hành khách</div>
                                    </div>
                                </Radio>
                                <Radio value="discount">
                                    <div>
                                        <Text strong>Vé ưu tiên</Text>
                                        <div className="text-xs text-gray-500">
                                            Học sinh, sinh viên, người cao tuổi, người khuyết tật...
                                        </div>
                                    </div>
                                </Radio>
                            </Radio.Group>
                        </div>
                    </div>

                    <div className="bg-[#f9fafb] rounded-xl border border-dashed border-gray-300 shadow-inner p-6 mt-8 text-sm">
                        <div className="text-center mb-4">
                            <Text className="text-base font-semibold text-blue-800">Thông tin vé</Text>
                        </div>

                        <ul className="space-y-2 text-gray-700">
                            <li>
                                <strong>Loại vé:</strong>{" "}
                                {ticketType === "normal" ? "Thường" : "Ưu tiên"}
                            </li>
                            <li>
                                <strong>Hiệu lực:</strong> 30 ngày từ ngày kích hoạt
                            </li>
                            <li>
                                <strong>Giá vé:</strong>{" "}
                                <span className="text-blue-700 font-semibold">
                                    {ticketPrices[ticketType].toLocaleString()}₫
                                </span>
                            </li>
                            {ticketType === "discount" && (
                                <>
                                    <li className="text-red-600 font-medium">
                                        * Yêu cầu xuất trình giấy tờ khi sử dụng
                                    </li>
                                    <li className="text-red-600 font-medium">
                                        * Nếu là sinh viên vui lòng xác nhận tại đây
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    <div className="mt-6 text-center">
                        <Button
                            type="primary"
                            size="large"
                            loading={loading}
                            onClick={handleBuy}
                            className="rounded-xl px-8"
                        >
                            Mua vé
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default BuyMonthlyTickets;
