import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import logoImg from "../../assets/logo.png";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AppstoreOutlined,
    BarChartOutlined,
    CloudOutlined,
    ShopOutlined,
    TeamOutlined,
    UploadOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';

import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import Footer from '../Footer';

const { Sider, Content } = Layout;

// 👉 Dynamic style depending on screen size (broken)
const getSiderStyle = (isBroken: boolean): React.CSSProperties => ({
    overflow: 'auto',
    height: '100vh',
    position: isBroken ? 'fixed' : 'sticky',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: isBroken ? 1000 : 100,
    backgroundColor: '#001529',
});

const menuItems: MenuProps['items'] = [
    UserOutlined,
    VideoCameraOutlined,
    UploadOutlined,
    BarChartOutlined,
    CloudOutlined,
    AppstoreOutlined,
    TeamOutlined,
    ShopOutlined,
].map((icon, index) => ({
    key: String(index + 1),
    icon: React.createElement(icon),
    label: `nav ${index + 1}`,
}));

const SideBarLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [broken, setBroken] = useState(false);

    return (
        <>
            <Layout hasSider className="min-h-[calc(100vh-80px)] relative">

                {broken && !collapsed && (
                    <div
                        className="fixed inset-0 bg-opacity-30 z-[999]"
                        onClick={() => setCollapsed(true)}
                    />
                )}

                {/* Toggle button khi Sider đang collapsed và màn nhỏ */}
                {collapsed && broken && (
                    <div
                        className="fixed top-3 left-0 z-[1001] p-2 bg-gray-800 text-white rounded cursor-pointer"
                        onClick={() => setCollapsed(false)}
                    >
                        <MenuUnfoldOutlined />
                    </div>
                )}

                <Sider
                    collapsible
                    collapsed={collapsed}
                    trigger={(broken) ? null : undefined}
                    collapsedWidth={broken ? 0 : 80}
                    breakpoint="lg"
                    onBreakpoint={(broken) => {
                        setBroken(broken);
                        if (broken) setCollapsed(true); // collapse when small
                    }}
                    onCollapse={(collapsed) => setCollapsed(collapsed)}
                    className="transition-all duration-300"
                    style={getSiderStyle(broken)}
                    width={220}
                >
                    {/* Toggle trong Sider khi màn lớn */}
                    {/* {!broken && (
                        <div
                            className="absolute top-5 right-0 z-50 p-1 bg-white rounded-full cursor-pointer"
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        </div>
                    )} */}

                    {/* Logo */}
                    <div className="h-15 bg-slate-800 text-white font-bold flex items-center justify-center p-2">
                        <img src={logoImg} alt="Logo" className="w-[90%]" />
                    </div>

                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={['1']}
                        items={menuItems}
                    />
                </Sider>

                <Layout>
                    <Content className="mx-4 my-6 overflow-auto">
                        <div className="bg-white rounded-xl p-6 shadow min-h-[60vh]">
                            <Outlet />
                            <p>long content</p>
                            {Array.from({ length: 100 }, (_, index) => (
                                <React.Fragment key={index}>
                                    {index % 20 === 0 && index ? 'more' : '...'}
                                    <br />
                                </React.Fragment>
                            ))}
                        </div>
                    </Content>
                </Layout>
            </Layout>

            <Footer />
        </>
    );
};

export default SideBarLayout;
