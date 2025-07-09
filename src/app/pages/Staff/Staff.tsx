import {
    AppstoreOutlined,
    BarChartOutlined,
    CloudOutlined,
    ShopOutlined,
    TeamOutlined,
    UploadOutlined,
    UserOutlined,
    VideoCameraOutlined,
    FileTextOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout } from 'antd';
import React, { useState } from 'react';
import AdjustTicket from './partials/AdjustTicket';

import Sidebar from '../../components/SideBar/Sidebar';
import TicketProcessingQR from '../../components/Test/TicketProcessingQR';
import CaseApproval from './partials/CaseApproval';
import { checkUserRole, logout } from '../../../api/auth/auth';
import { Navigate, useNavigate } from 'react-router-dom';

const { Content } = Layout;


const Staff: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [broken, setBroken] = useState(false);
    const [selectedKey, setSelectedKey] = useState('1');

    if (!checkUserRole(["STAFF"])) {
        return <Navigate to="/unauthorized" replace />;
    }

    const handleLogout = async () => {
        await logout();
    };

    const menuItems: MenuProps['items'] = [
        { key: '1', icon: <AppstoreOutlined />, label: 'Quét QR' },
        { key: '2', icon: <VideoCameraOutlined />, label: 'Thay đổi trạng thái vé' },
        { key: '3', icon: <FileTextOutlined />, label: 'Quản lý đơn' },
        {
            key: 'logout',
            icon: <LogoutOutlined style={{ color: 'red' }} />,
            label: <span style={{ color: 'red' }}>Đăng Xuất</span>,
            style: { marginTop: 24 }
        }
    ];

    const renderContent = () => {
        switch (selectedKey) {
            case '1':
                return <TicketProcessingQR />;
            case '2':
                return <AdjustTicket />;
            case '3':
                return <CaseApproval />;
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
                onMenuSelect={(key) => {
                    if (key === 'logout') {
                        handleLogout();
                    } else {
                        setSelectedKey(key);
                    }
                }}
                theme='dark'
            />

            <Layout>
                <Content className="mx-4 my-6 overflow-auto">
                    <div className="bg-white rounded-xl p-6 shadow min-h-[60vh]">
                        {renderContent()}

                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Staff;
