import {
    ApartmentOutlined,
    CarOutlined,
    DashboardOutlined,
    DollarCircleOutlined,
    LogoutOutlined,
    ClockCircleOutlined,
    SettingOutlined,
    UserOutlined,
    IdcardOutlined,
    FileTextOutlined,
    CrownOutlined,
    MailOutlined,
  } from '@ant-design/icons';
  import { Layout, Menu, Button, Modal } from 'antd';
  import React, { useEffect, useState } from 'react';
  import { Outlet, useLocation, useNavigate } from 'react-router-dom';
  import { logout } from '../../../api/auth/auth';
  import { getUserInfo, logTokenContents } from '../../../api/auth/tokenUtils';
  import { MetroLineApi } from '../../../api/metroLine/MetroLineApi';
  import type { GetMetroLineDTO } from '../../../api/metroLine/MetroLineInterface';
  import logoImg from "../../assets/logo.png";
  
  const { Header, Sider, Content } = Layout;
  
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
  "/stations/icon_t09.png",
  "/stations/icon_t10.png",
  "/stations/icon_t11.png",
  "/stations/icon_t12.png",
];

const statusMap = {
  0: { text: "Hoạt động bình thường", color: "text-green-500" }, // Normal
  1: { text: "Bị lỗi", color: "text-red-500" },                  // Faulty
  2: { text: "Bị chậm", color: "text-yellow-500" },              // Delayed
};

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = getUserInfo();
    const [isMetroStatusModalOpen, setIsMetroStatusModalOpen] = useState(false);
    const [metroLines, setMetroLines] = useState<GetMetroLineDTO[]>([]);
    const [metroLinesLoading, setMetroLinesLoading] = useState(true);
  
      useEffect(() => {
    // Log token contents when component mounts
    logTokenContents();
  }, []);

  useEffect(() => {
    const fetchMetroLines = async () => {
      try {
        setMetroLinesLoading(true);
        const res = await MetroLineApi.getAllMetroLines();
        setMetroLines(res.result || []);
      } catch (err) {
        setMetroLines([]);
      } finally {
        setMetroLinesLoading(false);
      }
    };
    fetchMetroLines();
  }, []);
  
      const menuItems = [
    {
      key: '/admin/accountInfo',
      icon: <UserOutlined />,
      label: 'Quản lý tài khoản',
    },
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Bảng Điều Khiển',
    },
    {
      key: 'station-management',
      icon: <ApartmentOutlined />,
      label: 'Quản Lý Trạm',
      children: [
        {
          key: '/admin/station',
          label: 'Danh Sách Trạm',
        },
        {
          key: '/admin/create-station',
          label: 'Tạo Trạm',
        },
      ],
    },
    {
      key: 'metro-line-management',
      icon: <CarOutlined />,
      label: 'Quản Lý Tuyến Metro',
      children: [
        {
          key: '/admin/metro-line',
          label: 'Danh Sách Tuyến Metro',
        },
        {
          key: '/admin/create-metro-line',
          label: 'Tạo Tuyến Metro',
        },
        {
          key: '/admin/add-metro-line-station',
          label: 'Thêm Trạm Vào Tuyến Metro',
        },
      ],
    },
    {
      key: 'train-schedule',
      icon: <ClockCircleOutlined />,
      label: 'Quản Lý Lịch Trình Tàu',
      children: [
        {
          key: '/admin/train-schedule',
          label: 'Danh Sách Lịch Trình Tàu',
        },
      ],
    },
    {
      key: 'fare-management',
      icon: <DollarCircleOutlined />,
      label: 'Quản Lý Giá Vé',
      children: [
        {
          key: '/admin/fare-rule',
          label: 'Quy Tắc Giá Vé',
        },
      ],
    },
    {
      key: 'ticket-transaction-management',
      icon: <IdcardOutlined />,
      label: 'Quản Lý Giao Dịch Vé',
      children: [
        {
          key: '/admin/transaction-ticket',
          label: 'Giao Dịch Vé',
        },
      ],
    },
    {
      key: 'log-activity-management',
      icon: <FileTextOutlined />,
      label: 'Quản Lý Hoạt Động',
      children: [
        {
          key: '/admin/log-activity',
          label: 'Hoạt động',
        },
      ],
    },
    {
      key: 'email-management',
      icon: <MailOutlined />,
      label: 'Quản Lý Email',
      children: [
        {
          key: '/admin/create-email-template',
          label: 'Tạo Email Template',
        },
        {
          key: '/admin/email-template',
          label: 'Danh Sách Email Template',
        },
      ],
    },
    {
      key: 'role-management',
      icon: <SettingOutlined />,
      label: 'Quản Lý Cấp Bậc',
      children: [
        {
          key: '/admin/managerList',
          label: 'Danh Sách Manager',
        },
        {
          key: '/admin/adminList',
          label: 'Danh Sách Admin',
        },
        {
          key: '/admin/set-role',
          label: 'Điều Chỉnh Cấp Bậc',
        },
      ],
    },
  ];
  
    const handleMenuClick = ({ key }: { key: string }) => {
      navigate(key);
    };
  
    const handleLogout = () => {
      logout();
      navigate("/login");
    };
  
    // Get the current menu label for the header
    const getCurrentMenuLabel = () => {
      const findLabel = (items: any[], path: string): string | undefined => {
        for (const item of items) {
          if (item.key === path) return item.label;
          if (item.children) {
            const childLabel = findLabel(item.children, path);
            if (childLabel) return childLabel;
          }
        }
        return undefined;
      };
  
      return findLabel(menuItems, location.pathname) || 'Dashboard';
    };
  

  
    return (
      <>
        <Layout className="min-h-screen h-screen">
        <Sider
          theme="light"
          className="shadow-lg flex flex-col"
          width={250}
        >
          <div className="flex flex-col items-center justify-center py-8 border-b">
            <img
              src={logoImg}
              alt="Logo"
              className="w-31 mb-2"
            />
            <h1 className="text-xl font-bold text-gray-800 text-center">Admin Portal</h1>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex flex-col justify-center h-full mt-8">
              <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={handleMenuClick}
                className="border-r-0"
              />
            </div>
            <div className="p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogoutOutlined />
                <span>Đăng Xuất</span>
              </button>
            </div>
          </div>
        </Sider>
        <Layout className="flex flex-col h-full">
          <Header className="bg-[#001529] px-4 md:px-6 shadow-sm">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-3">
                <CrownOutlined className="text-yellow-400 text-lg" />
                <h2 className="text-lg font-semibold text-white truncate">
                  {getCurrentMenuLabel()}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                {/* <Button
                  type="default"
                  icon={<ApartmentOutlined className="text-lg" />}
                  className="flex items-center gap-2 px-4 border-blue-900 text-blue-900 hover:!bg-blue-900 hover:!text-white transition-colors rounded-lg shadow-sm !h-auto"
                  onClick={() => setIsMetroStatusModalOpen(true)}
                >
                  <span className="hidden sm:text-sm sm:inline">Trạng thái tuyến Metro</span>
                </Button> */}
                <span className="text-white font-medium hidden sm:inline">{userInfo?.name || 'Admin'}</span>
                <img
                  src={userInfo?.avatarUrl || ""}
                  alt="User"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-white shadow"
                />
              </div>
            </div>
          </Header>
          <Content className="bg-white rounded-lg shadow-sm flex-1 overflow-auto">
            <div className="h-full flex flex-col items-center">
              <div className="w-full max-w-[1400px] px-6">
                <Outlet />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>

      <Modal
        title={<span className="text-blue-700 font-bold text-2xl">Trạng thái tuyến Metro</span>}
        open={isMetroStatusModalOpen}
        onCancel={() => setIsMetroStatusModalOpen(false)}
        footer={null}
        width={700}
        centered
      >
        <div className="flex flex-wrap gap-6 justify-center py-4">
          {metroLinesLoading ? (
            <div className="text-center text-gray-500 py-8 w-full">Đang tải trạng thái tuyến Metro...</div>
          ) : (
            metroLines
              .slice()
              .sort((a, b) => Number(a.metroLineNumber) - Number(b.metroLineNumber))
              .map((line, idx) => {
                const color = defaultColors[idx % defaultColors.length];
                const icon = defaultIcons[idx % defaultIcons.length];
                const statusInfo = statusMap[line.status] || { text: "Không xác định", color: "text-gray-500" };
                return (
                  <div
                    key={line.id}
                    className="bg-white rounded-xl shadow p-4 flex flex-col items-center w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ minWidth: 150 }}
                    tabIndex={0}
                    aria-label={`Thông tin ${line.metroName || `Tuyến Số ${line.metroLineNumber}`}`}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                      style={{ background: color }}
                    >
                      <img src={icon} alt={line.metroName || `Tuyến Số ${line.metroLineNumber}`} className="w-8 h-8" />
                    </div>
                    <div className="font-bold text-blue-700 text-base mb-1 text-center w-full">{line.metroName || `Tuyến Số ${line.metroLineNumber}`}</div>
                    <div className={`${statusInfo.color} text-2xl mb-1`} aria-label="Trạng thái hoạt động">●</div>
                    <div className="text-gray-900 text-sm text-center">{statusInfo.text}</div>
                  </div>
                );
              })
          )}
        </div>
      </Modal>
    </>
  );
};
  
  export default AdminLayout;
  
