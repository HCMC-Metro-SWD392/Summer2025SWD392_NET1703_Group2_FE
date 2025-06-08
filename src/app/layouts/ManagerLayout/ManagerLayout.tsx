import React, { useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  DollarCircleOutlined,
  LogoutOutlined,
  ApartmentOutlined,
  CarOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import logoImg from "../../assets/logo.png";
import { logout } from '../../../api/auth/auth';
import { getUserInfo, logTokenContents } from '../../../api/auth/tokenUtils';

const { Header, Sider, Content } = Layout;

const ManagerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = getUserInfo();

  useEffect(() => {
    // Log token contents when component mounts
    logTokenContents();
  }, []);

  const menuItems = [
    {
      key: '/manager',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'station-management',
      icon: <ApartmentOutlined />,
      label: 'Station Management',
      children: [
        {
          key: '/manager/station',
          label: 'Station List',
        },
        {
          key: '/manager/create-station',
          label: 'Create Station',
        },
      ],
    },
    {
      key: 'metro-line-management',
      icon: <CarOutlined />,
      label: 'Metro Line Management',
      children: [
        {
          key: '/manager/metro-line',
          label: 'Metro Line List',
        },
        {
          key: '/manager/create-metro-line',
          label: 'Create Metro Line',
        },
      ],
    },
    {
      key: 'fare-management',
      icon: <DollarCircleOutlined />,
      label: 'Fare Management',
      children: [
        {
          key: '/manager/fare-rule',
          label: 'Fare Rules',
        },
      ],
    },
    {
      key: '/manager/staffs',
      icon: <UserOutlined />,
      label: 'Staff Management',
    },
    {
      key: '/manager/revenue',
      icon: <DollarCircleOutlined />,
      label: 'Revenue',
    },
    {
      key: '/manager/promotion',
      icon: <DollarCircleOutlined />,
      label: 'Promotion',
    },
    {
      key: '/manager/create-subscription-ticket',
      icon: <DollarCircleOutlined />,
      label: 'Create Subscription Ticket',
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
          <h1 className="text-xl font-bold text-gray-800 text-center">Manager Portal</h1>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col justify-center h-full mt-8">
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              defaultOpenKeys={['station-management', 'metro-line-management', 'fare-management']}
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
              <span>Logout</span>
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
              <span className="text-white font-medium hidden sm:inline">{userInfo?.name || 'Manager'}</span>
              <img
                src={userInfo?.avatarUrl || ""}
                alt="User"
                className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-white shadow"
              />
            </div>
          </div>
        </Header>
        <Content className="bg-white rounded-lg shadow-sm flex-1 overflow-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManagerLayout;
