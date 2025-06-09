import React from "react";
import logoImg from "../../assets/logo.png";
import { Button } from "antd";
import {
  GlobalOutlined,
  SearchOutlined,
  MenuOutlined,
  LoginOutlined, UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import UserHeaderMenu from "./partials/UserHeaderMenu";
import TicketServiceMenu from "./partials/TicketServiceMenu";

export default function Header() {
  const navigate = useNavigate();
  const storedUserInfo = localStorage.getItem("userInfo");
  const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;

  return (
    <>
      <header className="sticky top-0 z-50 flex justify-between  px-6 py-3 shadow-md bg-white h-20">
        <a className="w-45" href="/">
          <img src={logoImg} alt="" />
        </a>

        <div className="flex gap-3">
          {/* <div className="flex items-center gap-2 bg-gray-200 rounded-md px-3 py-2">
            <div className="w-4 h-4 border-4 border-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <div className="text-sm leading-tight">
              <div className="text-gray-600">Service Information</div>
              <div className="text-blue-800 font-semibold">Normal service</div>
            </div>
          </div> */}

          {!userInfo ? (
          <>
            {[
              { label: "Đăng nhập", icon: <LoginOutlined className="text-xl" />, path: "/login" },
              { label: "Đăng ký", icon: <UserAddOutlined className="text-xl" />, path: "/register" },
            ].map(({ label, icon, path }) => (
              <Button
                key={label}
                type="default"
                icon={icon}
                onClick={() => navigate(path)}
                className="flex items-center gap-2 px-4 border-blue-900 text-blue-900 hover:!bg-blue-900 hover:!text-white transition-colors rounded-lg shadow-sm !h-auto"
              >
                <span className="text-sm">{label}</span>
              </Button>
            ))}
          </>
        ) : (
          <>
            <TicketServiceMenu/>
            <UserHeaderMenu userInfo={userInfo} />
          </>
        )}

          {/* <TicketServiceMenu/>

          <UserHeaderMenu userInfo={{
            id: "12345",
            fullName: "Nguyen Van A",
            email: "nguyenvana@example.com"
          }} /> */}

        </div>
      </header>

    </>
  );
}
