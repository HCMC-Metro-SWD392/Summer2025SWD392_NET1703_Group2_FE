import {
  ApartmentOutlined,
  CarOutlined,
  DashboardOutlined,
  DollarCircleOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  TeamOutlined,
  BarChartOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Badge, Avatar, Dropdown, Typography, Space } from 'antd';
import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../../api/auth/auth';
import { getUserInfo, logTokenContents } from '../../../api/auth/tokenUtils';
import logoImg from "../../assets/logo.png";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

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
      label: 'Bảng Điều Khiển',
    },
    {
      key: 'staffs',
      icon: <UserOutlined />,
      label: 'Quản Lý Nhân Viên',
      children: [
        {
          key: '/manager/staffs',
          label: 'Danh Sách Nhân Viên',
        },
        {
          key: '/manager/create-staff',
          label: 'Tạo Nhân Viên',
        },
        {
          key: '/manager/staff-schedule',
          label: 'Lịch Làm Việc',
        },
      ],
    },
    {
      key: 'sales-finance',
      icon: <DollarCircleOutlined />,
      label: 'Bán Hàng & Tài Chính',
      children: [
        {
          key: '/manager/revenue',
          label: 'Doanh Thu',
        },
        {
          key: '/manager/promotion',
          label: 'Khuyến Mãi',
        },
        // {
        //   key: '/manager/subscription-ticket',
        //   label: 'Vé Đăng Ký',
        // },
        {
          key: '/manager/transaction-ticket',
          label: 'Giao dịch vé',
        },
      ],
    },
    {
      key: '/manager/accountInfo',
      icon: <UserOutlined />,
      label: 'Quản lý tài khoản',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const managerHeaderMenu = (
    <Menu
      items={[
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'Hồ sơ cá nhân',
          onClick: () => navigate('/manager/accountInfo'),
        },
        {
          key: 'staff-management',
          icon: <TeamOutlined />,
          label: 'Quản lý nhân viên',
          onClick: () => navigate('/manager/staffs'),
        },
        {
          key: 'revenue',
          icon: <BarChartOutlined />,
          label: 'Báo cáo doanh thu',
          onClick: () => navigate('/manager/revenue'),
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Đăng xuất',
          onClick: handleLogout,
        },
      ]}
    />
  );

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
        <Header className="bg-gradient-to-r from-green-700 to-green-600 px-4 md:px-6 shadow-lg">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <TrophyOutlined className="text-yellow-400 text-xl" />
              <h2 className="text-lg font-semibold text-white truncate">
                {getCurrentMenuLabel()}
              </h2>
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-800 rounded-full">
                <BarChartOutlined className="text-green-200" />
                <Text className="text-green-100 text-sm">Quản lý hệ thống</Text>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Badge count={5} size="small">
                <button className="text-white hover:text-green-200 transition-colors">
                  <BellOutlined className="text-lg" />
                </button>
              </Badge>
              
              {/* Quick Actions */}
              <div className="hidden lg:flex items-center gap-2">
                <button 
                  onClick={() => navigate('/manager/revenue')}
                  className="px-3 py-1 bg-green-800 hover:bg-green-600 text-white text-sm rounded-md transition-colors"
                >
                  Doanh thu
                </button>
                <button 
                  onClick={() => navigate('/manager/staffs')}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md transition-colors"
                >
                  Nhân viên
                </button>
                <button 
                  onClick={() => navigate('/manager/promotion')}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-md transition-colors"
                >
                  Khuyến mãi
                </button>
              </div>
              
              {/* User Info */}
              <Dropdown overlay={managerHeaderMenu} trigger={['click']} placement="bottomRight">
                <div className="flex items-center gap-2 cursor-pointer hover:bg-green-800 px-2 py-1 rounded-md transition-colors">
                  <Avatar 
                    src={userInfo?.avatarUrl} 
                    icon={<UserOutlined />}
                    className="border-2 border-white"
                  />
                  <div className="hidden sm:block text-left">
                    <Text className="text-white font-medium block text-sm">
                      {userInfo?.name || 'Manager'}
                    </Text>
                    <Text className="text-green-200 text-xs block">
                      Quản lý
                    </Text>
                  </div>
                </div>
              </Dropdown>
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

export default ManagerLayout;
