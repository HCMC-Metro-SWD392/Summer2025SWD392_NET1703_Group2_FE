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
    CalendarOutlined,
    BellOutlined,
    QrcodeOutlined,
    CheckCircleOutlined,
    ToolOutlined,
    EditOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Badge, Avatar, Dropdown, Typography, Menu } from 'antd';
import React, { useState } from 'react';
import AdjustTicket from './partials/AdjustTicket';

import Sidebar from '../../components/SideBar/Sidebar';
import TicketProcessingQR from '../../components/Test/TicketProcessingQR';
import CaseApproval from './partials/CaseApproval';
import { checkUserRole, logout } from '../../../api/auth/auth';
import { Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import StaffWorkSchedule from './partials/StaffWorkSchedule';
import { getUserInfo } from '../../../api/auth/tokenUtils';

const { Content, Header } = Layout;
const { Text } = Typography;

const Staff: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [broken, setBroken] = useState(false);
    const [selectedKey, setSelectedKey] = useState('1');
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = getUserInfo();

    if (!checkUserRole(["STAFF"])) {
        return <Navigate to="/unauthorized" replace />;
    }

    const handleLogout = async () => {
        await logout();
    };

    const staffHeaderMenu = (
        <Menu
            items={[
                {
                    key: 'profile',
                    icon: <UserOutlined />,
                    label: 'Hồ sơ cá nhân',
                    onClick: () => navigate('/staff/accountInfo'),
                },
                {
                    key: 'qr-scanner',
                    icon: <QrcodeOutlined />,
                    label: 'Quét QR vé',
                    onClick: () => setSelectedKey('1'),
                },
                {
                    key: 'ticket-adjustment',
                    icon: <ToolOutlined />,
                    label: 'Điều chỉnh vé',
                    onClick: () => setSelectedKey('2'),
                },
                {
                    key: 'case-approval',
                    icon: <CheckCircleOutlined />,
                    label: 'Phê duyệt đơn',
                    onClick: () => setSelectedKey('3'),
                },
                {
                    type: 'divider',
                },
                {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: 'Đăng xuất',
                    onClick: handleLogout,
                },
            ]}
        />
    );

    const menuItems: MenuProps['items'] = [
        { key: 'account', icon: <UserOutlined />, label: 'Quản lý tài khoản' },
        { key: '1', icon: <AppstoreOutlined />, label: 'Quét QR' },
        { key: '2', icon: <VideoCameraOutlined />, label: 'Thay đổi trạng thái vé' },
        { key: '3', icon: <FileTextOutlined />, label: 'Quản lý đơn' },
        { key: '4', icon: <CalendarOutlined />, label: 'Lịch làm việc' },
        {
            key: 'news-management',
            icon: <EditOutlined />,
            label: 'Quản lý tin tức',
            children: [
                { key: 'create-news', icon: <EditOutlined />, label: 'Tạo tin tức' },
                { key: 'news-list', icon: <UnorderedListOutlined />, label: 'Danh sách tin tức' },
            ]
        },
        { key: '5', icon: <LogoutOutlined />, label: 'Đăng xuất' },
    ];

    const renderContent = () => {
        switch (selectedKey) {
            case '1':
                return <TicketProcessingQR />;
            case '2':
                return <AdjustTicket />;
            case '3':
                return <CaseApproval />;
            case '4':
                return <StaffWorkSchedule />;
            case '5':
                logout();
                navigate('/login');
                return null;
            case 'account':
                return <div>Quản lý tài khoản - Vui lòng sử dụng menu bên trái để truy cập</div>;
            default:
                return <div>Nội dung cho menu {selectedKey}</div>;
        }
    };

    const getCurrentMenuLabel = () => {
        // Handle nested routes
        if (location.pathname === '/staff/accountInfo') {
            return 'Quản Lý Tài Khoản';
        }
        if (location.pathname === '/staff/case-approval') {
            return 'Phê Duyệt Đơn';
        }
        if (location.pathname === '/staff/create-news') {
            return 'Tạo Tin Tức';
        }
        if (location.pathname === '/staff/news-list') {
            return 'Danh Sách Tin Tức';
        }
        
        // Handle main staff page
        const menuLabels: { [key: string]: string } = {
            '1': 'Quét QR Vé',
            '2': 'Thay Đổi Trạng Thái Vé',
            '3': 'Quản Lý Đơn',
            '4': 'Lịch Làm Việc',
            'account': 'Quản Lý Tài Khoản',
            'create-news': 'Tạo Tin Tức',
            'news-list': 'Danh Sách Tin Tức',
        };
        return menuLabels[selectedKey] || 'Staff Dashboard';
    };

    // Check if we're on a nested route
    const isNestedRoute = location.pathname !== '/staff';

    // Get the correct selected key based on current path
    const getCurrentSelectedKey = () => {
        if (location.pathname === '/staff/accountInfo') {
            return 'account';
        }
        if (location.pathname === '/staff/case-approval') {
            return '3';
        }
        if (location.pathname === '/staff/create-news') {
            return 'create-news';
        }
        if (location.pathname === '/staff/news-list') {
            return 'news-list';
        }
        return selectedKey;
    };

    const renderMainContent = () => {
        if (isNestedRoute) {
            return <Outlet />;
        }
        return renderContent();
    };

    return (
        <Layout hasSider className="min-h-screen h-screen">
            <Sidebar
                collapsed={collapsed}
                broken={broken}
                setCollapsed={setCollapsed}
                setBroken={setBroken}
                menuItems={menuItems}
                selectedKeys={[getCurrentSelectedKey()]}
                onMenuSelect={(key) => {
                    if (key === 'logout') {
                        handleLogout();
                    } else if (key === 'account') {
                        navigate('/staff/accountInfo');
                    } else if (key === 'create-news') {
                        navigate('/staff/create-news');
                    } else if (key === 'news-list') {
                        navigate('/staff/news-list');
                    } else if (key === '3') {
                        navigate('/staff/case-approval');
                    } else {
                        setSelectedKey(key);
                        // Navigate back to main staff page if we're on a nested route
                        if (isNestedRoute) {
                            navigate('/staff');
                        }
                    }
                }}
                theme='dark'
            />

            <Layout className="flex flex-col h-full">
                <Header className="bg-gradient-to-r from-orange-600 to-orange-500 px-4 md:px-6 shadow-lg">
                    <div className="flex items-center justify-between h-full">
                        <div className="flex items-center gap-4">
                            <QrcodeOutlined className="text-yellow-300 text-xl" />
                            <h2 className="text-lg font-semibold text-white truncate">
                                {getCurrentMenuLabel()}
                            </h2>
                            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-orange-700 rounded-full">
                                <ToolOutlined className="text-orange-200" />
                                <Text className="text-orange-100 text-sm">Hệ thống nhân viên</Text>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <Badge count={2} size="small">
                                <button className="text-white hover:text-orange-200 transition-colors">
                                    <BellOutlined className="text-lg" />
                                </button>
                            </Badge>
                            
                            {/* Quick Actions */}
                            <div className="hidden lg:flex items-center gap-2">
                                <button 
                                    onClick={() => setSelectedKey('1')}
                                    className="px-3 py-1 bg-orange-700 hover:bg-orange-600 text-white text-sm rounded-md transition-colors"
                                >
                                    Quét QR
                                </button>
                                <button 
                                    onClick={() => setSelectedKey('3')}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-sm rounded-md transition-colors"
                                >
                                    Phê duyệt
                                </button>
                                <button 
                                    onClick={() => setSelectedKey('4')}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md transition-colors"
                                >
                                    Lịch làm việc
                                </button>
                            </div>
                            
                            {/* User Info */}
                            <Dropdown overlay={staffHeaderMenu} trigger={['click']} placement="bottomRight">
                                <div className="flex items-center gap-2 cursor-pointer hover:bg-orange-700 px-2 py-1 rounded-md transition-colors">
                                    <Avatar 
                                        src={userInfo?.avatarUrl} 
                                        icon={<UserOutlined />}
                                        className="border-2 border-white"
                                    />
                                    <div className="hidden sm:block text-left">
                                        <Text className="text-white font-medium block text-sm">
                                            {userInfo?.name || 'Staff'}
                                        </Text>
                                        <Text className="text-orange-200 text-xs block">
                                            Nhân viên
                                        </Text>
                                    </div>
                                </div>
                            </Dropdown>
                        </div>
                    </div>
                </Header>

                <Content className="bg-white rounded-lg shadow-sm flex-1 overflow-auto">
                    <div className="h-full flex flex-col items-center">
                        <div className="w-full max-w-[1400px] px-6 py-6">
                            <div className="bg-white rounded-xl p-6 shadow min-h-[60vh]">
                                {renderMainContent()}
                            </div>
                        </div>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Staff;
