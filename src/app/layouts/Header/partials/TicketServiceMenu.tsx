import { CalendarOutlined, CreditCardOutlined, ProfileOutlined, ShoppingCartOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, Space, Typography } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const TicketServiceMenu: React.FC = () => {
  const navigate = useNavigate();

  const menu = (
    <Menu
      items={[
        {
          key: "ticket-buy",
          label: "Mua vé",
          icon: <CreditCardOutlined />,
          onClick: () => navigate("/tickets/buy-route"),
        },
        {
          key: "ticket-list",
          icon: <ProfileOutlined />,
          label: "Quản lý vé",
          onClick: () => navigate("/tickets/my-tickets")
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
        <Space className="!block sm:!flex">
          <UnorderedListOutlined />
          {/* Chỉ hiện trên màn hình >= sm */}
          <Text strong className="hidden sm:inline">Dịch vụ vé tàu</Text>

        </Space>
      </Button>
    </Dropdown>
  );
};

export default TicketServiceMenu;
