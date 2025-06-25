import { AppstoreOutlined, FileAddOutlined, FileTextOutlined, LogoutOutlined, ProfileOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, Menu, Space, Typography } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../../api/auth/auth";
import type { UserInfo } from "../../../../types/types";


const { Text } = Typography;

const UserHeaderMenu: React.FC<{ userInfo: UserInfo }> = ({ userInfo }) => {
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
            {userInfo.fullName}
          </Text>
        </Space>
      </Button>
    </Dropdown>
  );
};

export default UserHeaderMenu;
