import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Spin, Result, Alert } from "antd";

import axios from "axios";
import endpoints from "../../../../../../../api/endpoints";
import { BASE_URL } from "../../../../../../../settings/axiosInstance";

type Status = "loading" | "success" | "error" | "invalid";

const VerifyEmail = () => {

    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const token = searchParams.get("token");
    const [status, setStatus] = useState<Status>("loading");
    let called = false;

    useEffect(() => {
        const verifyEmail = async () => {
            if (called) return;
            called = true;

            try {
                const response = await axios.post(endpoints.verifyEmail,
                    {},
                    {
                        baseURL: BASE_URL,
                        params: {
                            email,
                            token,
                        },
                    });

                console.log("✅ Xác minh thành công:", response.data);
                setStatus("success");
            } catch (error) {
                console.error("❌ Lỗi xác minh:", error);
                setStatus("error");
            }
        };

        if (email && token) {
            verifyEmail();
        } else {
            setStatus("invalid");
        }
    }, [email, token]);

    return (
        <div className="p-4 flex justify-center items-center min-h-[calc(100vh-80px)] bg-[#E9F5FB]">
            {status === "loading" && (
                <div className="flex flex-col items-center gap-4">
                    <Spin size="large" />
                    <p className="text-gray-600 text-xl">Đang xác minh email...</p>
                </div>
            )}

            {status === "success" && (
                <Result
                    status="success"
                    title="Xác minh thành công"
                    subTitle={<p className="text-xl text-gray-700">Email của bạn đã được xác minh thành công. Cảm ơn bạn!</p>}
                />
            )}

            {status === "error" && (
                <Result
                    status="error"
                    title="Xác minh thất bại"
                    subTitle={<p className="text-xl text-gray-700">Đã có lỗi xảy ra khi xác minh email. Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>}
                />
            )}

            {status === "invalid" && (
                <Alert
                    message="Đường dẫn không hợp lệ"
                    description="Email hoặc mã xác minh không hợp lệ."
                    type="warning"
                    showIcon
                />
            )}
        </div>
    );
};

export default VerifyEmail;
