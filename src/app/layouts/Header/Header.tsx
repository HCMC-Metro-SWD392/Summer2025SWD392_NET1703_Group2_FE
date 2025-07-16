import {
  LoginOutlined, UserAddOutlined, ApartmentOutlined
} from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo.png";
import TicketServiceMenu from "./partials/TicketServiceMenu";
import UserHeaderMenu from "./partials/UserHeaderMenu";
import { useState } from "react";

// For now, hardcoded metro line status (can refactor to share with Home.tsx)
const defaultColors = [
  "#FFA500", // orange
  "#FF3B30", // red
  "#4A90E2", // blue
  "#50E3C2", // teal
  "#B8E986", // light green
  "#BD10E0", // purple
  "#7ED321", // green
  "#A0522D", // brown
];
const defaultIcons = [
  "/stations/icon_t01.png",
  "/stations/icon_t02.png",
  "/stations/icon_t03.png",
  "/stations/icon_t04.png",
  "/stations/icon_t05.png",
  "/stations/icon_t06.png",
  "/stations/icon_t07.png",
  "/stations/icon_t08.png",
];
const metroLineStatusList = [
  { code: "T1", name: "Tuyến Số 1", icon: defaultIcons[0], status: "Normal service", color: defaultColors[0] },
  { code: "T2", name: "Tuyến Số 2", icon: defaultIcons[1], status: "Normal service", color: defaultColors[1] },
  { code: "T3", name: "Tuyến Số 3", icon: defaultIcons[2], status: "Normal service", color: defaultColors[2] },
  { code: "T4", name: "Tuyến Số 4", icon: defaultIcons[3], status: "Normal service", color: defaultColors[3] },
  { code: "T5", name: "Tuyến Số 5", icon: defaultIcons[4], status: "Normal service", color: defaultColors[4] },
  { code: "T6", name: "Tuyến Số 6", icon: defaultIcons[5], status: "Normal service", color: defaultColors[5] },
  { code: "T7", name: "Tuyến Số 7", icon: defaultIcons[6], status: "Normal service", color: defaultColors[6] },
  { code: "T8", name: "Tuyến Số 8", icon: defaultIcons[7], status: "Normal service", color: defaultColors[7] },
];

export default function Header() {
  const navigate = useNavigate();
  const storedUserInfo = localStorage.getItem("userInfo");
  const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;
  const [isMetroStatusModalOpen, setIsMetroStatusModalOpen] = useState(false);

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

          <Button
            type="default"
            icon={<ApartmentOutlined className="text-xl" />}
            className="flex items-center gap-2 px-4 border-blue-900 text-blue-900 hover:!bg-blue-900 hover:!text-white transition-colors rounded-lg shadow-sm !h-auto"
            onClick={() => setIsMetroStatusModalOpen(true)}
          >
            <span className="hidden sm:text-sm sm:inline">Trạng thái tuyến Metro</span>
          </Button>
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
                  <span className="hidden sm:text-sm sm:inline">{label}</span>
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

      <Modal
        title={<span className="text-blue-700 font-bold text-2xl">Trạng thái tuyến Metro</span>}
        open={isMetroStatusModalOpen}
        onCancel={() => setIsMetroStatusModalOpen(false)}
        footer={null}
        width={700}
        centered
      >
        <div className="flex flex-wrap gap-6 justify-center py-4">
          {metroLineStatusList.map((line) => (
            <div
              key={line.code}
              className="bg-white rounded-xl shadow p-4 flex flex-col items-center w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ minWidth: 150 }}
              tabIndex={0}
              aria-label={`Thông tin ${line.name}`}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                style={{ background: line.color }}
              >
                <img src={line.icon} alt={line.name} className="w-8 h-8" />
              </div>
              <div className="font-bold text-blue-700 text-base mb-1 text-center w-full">{line.name}</div>
              <div className="text-green-500 text-2xl mb-1" aria-label="Trạng thái hoạt động">●</div>
              <div className="text-gray-900 text-sm">{line.status}</div>
            </div>
          ))}
        </div>
      </Modal>

    </>
  );
}
