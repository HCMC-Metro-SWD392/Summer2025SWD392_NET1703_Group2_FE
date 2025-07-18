import { AppstoreOutlined, FileAddOutlined, FileTextOutlined, LogoutOutlined, ProfileOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, Menu, Space, Typography } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../../api/auth/auth";
import { getUserInfo } from "../../../../api/auth/tokenUtils";
import type { UserInfo } from "../../../../types/types";


const { Text } = Typography;

const UserHeaderMenu: React.FC<{ userInfo: UserInfo }> = ({ userInfo }) => {
  const navigate = useNavigate();
  const tokenUserInfo = getUserInfo();
  const userRole = tokenUserInfo?.role?.toUpperCase?.() || '';

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getAccountInfoPath = () => {
    switch (userRole) {
      case 'ADMIN':
        return '/admin/accountInfo';
      case 'MANAGER':
        return '/manager/accountInfo';
      case 'STAFF':
        return '/staff/accountInfo';
      default:
        return '/accountInfo';
    }
  };

  const menu = (
    <Menu
      items={[
        {
          key: "profile",
          icon: <ProfileOutlined />,
          label: "Hồ sơ cá nhân",
          onClick: () => navigate(getAccountInfoPath()),
        },
        {
          key: "change-password",
          icon: <FileTextOutlined />,
          label: "Đổi mật khẩu",
          onClick: () => navigate("/change-password"),
        },
        {
          key: "service",
          icon: <AppstoreOutlined />,
          label: "Dịch vụ",
          children: [
            {
              key: "submit-request",
              icon: <FileTextOutlined />,
              label: "Nộp đơn",
              onClick: () => navigate("/services/specialCaseForm"),
            },
            {
              key: "my-request",
              icon: <FileTextOutlined />,
              label: "Xem đơn",
              onClick: () => navigate("/services/mySubmittedRequest"),
            },
          ],
        },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: "Đăng xuất",
          onClick: handleLogout,
        },
      ]}
    />
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]}>
      <Button type="text" className="flex items-center gap-2 !h-auto !border-gray-300 rounded-lg">
        <Space className="!block sm:!flex">
          {userInfo?.avatar ? (
            <Avatar src={userInfo.avatar} />
          ) : (
            <Avatar icon={<UserOutlined />} />
          )}
          <Text strong className="hidden sm:inline">
            <span
              className="block max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap align-middle"
              title={userInfo.fullName}
            >
              {userInfo.fullName}
            </span>
          </Text>
        </Space>
      </Button>
    </Dropdown>
  );
};

export default UserHeaderMenu;
