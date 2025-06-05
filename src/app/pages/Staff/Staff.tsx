import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
    AppstoreOutlined,
    BarChartOutlined,
    CloudOutlined,
    ShopOutlined,
    TeamOutlined,
    UploadOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';

import Sidebar from '../../components/SideBar/Sidebar';
import LoginForm from '../Home/partials/Login/LoginForm';

const { Content } = Layout;

const Staff: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [broken, setBroken] = useState(false);
    const [selectedKey, setSelectedKey] = useState('1');

    const menuItems: MenuProps['items'] = [
        { key: '1', icon: <UserOutlined />, label: 'Login' },
        { key: '2', icon: <VideoCameraOutlined />, label: 'Video' },
        { key: '3', icon: <UploadOutlined />, label: 'Upload' },
        { key: '4', icon: <BarChartOutlined />, label: 'Charts' },
        { key: '5', icon: <CloudOutlined />, label: 'Cloud' },
        { key: '6', icon: <AppstoreOutlined />, label: 'Apps' },
        { key: '7', icon: <TeamOutlined />, label: 'Team' },
        { key: '8', icon: <ShopOutlined />, label: 'Shop' },
    ];

    const renderContent = () => {
        switch (selectedKey) {
            case '1':
                return <LoginForm />;
            default:
                return <div>Nội dung cho menu {selectedKey}</div>;
        }
    };

    return (
        <Layout hasSider className="min-h-[calc(100vh-80px)] relative">
            <Sidebar
                collapsed={collapsed}
                broken={broken}
                setCollapsed={setCollapsed}
                setBroken={setBroken}
                menuItems={menuItems}
                onMenuSelect={(key) => setSelectedKey(key)}
                theme='dark'
            />

            <Layout>
                <Content className="mx-4 my-6 overflow-auto">
                    <div className="bg-white rounded-xl p-6 shadow min-h-[60vh]">
                        {renderContent()}
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
    );
};

export default Staff;
