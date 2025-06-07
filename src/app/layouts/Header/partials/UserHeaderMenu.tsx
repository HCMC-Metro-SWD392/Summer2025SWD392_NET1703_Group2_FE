import React from "react";
import { Dropdown, Avatar, Menu, Button, Space, Typography } from "antd";
import { UserOutlined, LogoutOutlined, ProfileOutlined, AppstoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../../api/auth/auth";
import type { UserInfo } from "../../../../types/types";

const { Text } = Typography;

const UserHeaderMenu: React.FC<{userInfo : UserInfo}> = ({ userInfo }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menu = (
    <Menu
      items={[
        {
          key: "profile",
          icon: <ProfileOutlined />,
          label: "Hồ sơ cá nhân",
          onClick: () => navigate("/customerInfor"),
        },
        {
          key: "service",
          icon: <AppstoreOutlined />,
          label: "Dịch vụ",
          onClick: () => navigate("/service"),
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
            {userInfo.fullName}
          </Text>
        </Space>
      </Button>
    </Dropdown>
  );
};

export default UserHeaderMenu;
