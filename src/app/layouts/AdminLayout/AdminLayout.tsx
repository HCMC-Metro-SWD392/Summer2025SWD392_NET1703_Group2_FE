import {
    ApartmentOutlined,
    CarOutlined,
    DashboardOutlined,
    DollarCircleOutlined,
    LogoutOutlined,
    ClockCircleOutlined,
    SettingOutlined,
    UserOutlined,
  } from '@ant-design/icons';
  import { Layout, Menu } from 'antd';
  import React, { useEffect } from 'react';
  import { Outlet, useLocation, useNavigate } from 'react-router-dom';
  import { logout } from '../../../api/auth/auth';
  import { getUserInfo, logTokenContents } from '../../../api/auth/tokenUtils';
  import logoImg from "../../assets/logo.png";
  
  const { Header, Sider, Content } = Layout;
  
  const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = getUserInfo();
  
    useEffect(() => {
      // Log token contents when component mounts
      logTokenContents();
    }, []);
  
    const menuItems = [
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
              <h2 className="text-lg font-semibold text-white truncate">
                {getCurrentMenuLabel()}
              </h2>
              <div className="flex items-center gap-4">
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
    );
  };
  
  export default AdminLayout;
  