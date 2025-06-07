import React from "react";
import { Dropdown, Menu, Button, Space, Typography } from "antd";
import { UnorderedListOutlined, HistoryOutlined, SettingOutlined, ClockCircleOutlined, CheckCircleOutlined, ShoppingCartOutlined, CalendarOutlined, CreditCardOutlined, ProfileOutlined } from "@ant-design/icons";
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
          children: [
            {
              key: "buy-single",
              label: "Mua vé lượt",
              icon: <ShoppingCartOutlined />,
              onClick: () => navigate("/tickets/buy-route"),
            },
            {
              key: "buy-monthly",
              label: "Mua vé tháng",
              icon: <CalendarOutlined />,
              onClick: () => navigate("/tickets/buy-monthly"),
            },
          ],
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
