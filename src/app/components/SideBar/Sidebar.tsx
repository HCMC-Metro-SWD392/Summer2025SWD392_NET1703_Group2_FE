import { MenuUnfoldOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, Button } from 'antd';
import React from 'react';
import logoMetro from "../../assets/logo.png";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  broken: boolean;
  setCollapsed: (val: boolean) => void;
  setBroken: (val: boolean) => void;
  menuItems: MenuProps['items'];      // ✅ nhận menuItems qua props
  onMenuSelect: (key: string) => void;
  onLogout?: () => void;
  theme?: 'light' | 'dark';
  selectedKeys?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  broken,
  setCollapsed,
  setBroken,
  menuItems,
  onMenuSelect,
  onLogout,
  theme,
  selectedKeys,
}) => {
  return (
    <>
      {broken && !collapsed && (
        <div
          className="fixed inset-0 bg-opacity-60 backdrop-blur-md z-[999]"
          onClick={() => setCollapsed(true)}
        />
      )}
      {collapsed && broken && (
        <div
          className="fixed top-3 left-0 z-[1001] p-2 bg-gray-800 text-white rounded cursor-pointer"
          onClick={() => setCollapsed(false)}
        >
          <MenuUnfoldOutlined />
        </div>
      )}
      <Sider
        theme={theme}
        collapsible
        collapsed={collapsed}
        trigger={broken ? null : undefined}
        collapsedWidth={broken ? 0 : 80}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          setBroken(broken);
          if (broken) setCollapsed(true);
        }}
        onCollapse={setCollapsed}
        width={220}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: broken ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: broken ? 1000 : 100,
          // backgroundColor: theme === 'light' ? '#ffffff' : '#001529',
        }}
      >
        <div className={`h-20 bg-slate-800 text-white font-bold flex items-center justify-center p-2`}>
          <img src={logoMetro} alt="Logo" className="w-[90%]" />
        </div>
        <Menu
          theme={theme}
          mode="inline"
          selectedKeys={selectedKeys || ['1']}
          items={menuItems}
          onClick={({ key }) => onMenuSelect(key)}
        />
        {onLogout && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={onLogout}
              block
              size="large"
            >
              {!collapsed && 'Đăng xuất'}
            </Button>
          </div>
        )}
      </Sider>
    </>
  );
};

export default Sidebar;