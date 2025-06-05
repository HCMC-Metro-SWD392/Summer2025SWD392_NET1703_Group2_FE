import React from "react";
import { Dropdown, Menu, Button, Space, Typography } from "antd";
import { UnorderedListOutlined, HistoryOutlined, SettingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const TicketServiceMenu: React.FC = () => {
  const navigate = useNavigate();

  const menu = (
    <Menu
      items={[
        {
          key: "ticket-list",
          icon: <UnorderedListOutlined />,
          label: "Danh sách vé",
          onClick: () => navigate("/tickets"),
        },
        {
          key: "history",
          icon: <HistoryOutlined />,
          label: "Lịch sử đặt vé",
          onClick: () => navigate("/tickets/history"),
        },
        {
          key: "settings",
          icon: <SettingOutlined />,
          label: "Cài đặt dịch vụ",
          onClick: () => navigate("/tickets/settings"),
        },
      ]}
    />
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]}>
      <Button
        type="text"
        className="flex items-center gap-2 !h-auto !border-gray-300 rounded-lg"
      >
        <Space>
          <UnorderedListOutlined />
          {/* Chỉ hiện trên màn hình >= sm */}
          <Text strong className="hidden sm:inline">Dịch vụ vé tàu</Text>
        </Space>
      </Button>
    </Dropdown>
  );
};

export default TicketServiceMenu;
