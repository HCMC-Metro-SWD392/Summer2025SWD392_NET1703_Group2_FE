import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Avatar, Divider, Spin, Alert } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, IdcardOutlined, ManOutlined, WomanOutlined, StarOutlined, CalendarOutlined } from '@ant-design/icons';
import styles from './CustomerInfo.module.css';
import UpdateProfileButton from './UpdateProfileButton';
import axiosInstance from '../../../../../settings/axiosInstance';
import type { UserInfo } from '../../../../../types/types';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../../../../../api/auth/tokenUtils';

const { Title, Text } = Typography;

const CustomerInfo: React.FC = () => {
    const navigate = useNavigate();
    const user: UserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userId = user.id;
    const [customerData, setCustomerData] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get current user role from token
    const currentUser = getUserInfo();
    const userRole = currentUser?.role?.toUpperCase() || '';

    const getRoleDisplayName = (role: string) => {
        switch (role?.toUpperCase()) {
            case 'CUSTOMER': return 'Khách hàng';
            case 'STAFF': return 'Nhân viên';
            case 'MANAGER': return 'Quản lý';
            case 'ADMIN': return 'Quản trị viên';
            default: return 'Người dùng';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role?.toUpperCase()) {
            case 'CUSTOMER': return '#1890ff';
            case 'STAFF': return '#52c41a';
            case 'MANAGER': return '#faad14';
            case 'ADMIN': return '#f5222d';
            default: return '#666';
        }
    };

    const getCustomerTypeDisplayName = (customerType: number) => {
        switch (customerType) {
            case 0: return 'Khách hàng thường';
            case 1: return 'Học sinh/Sinh viên';
            default: return 'Khách hàng thường';
        }
    };

    useEffect(() => {
        if (!userId) {
            setError('No user ID found. Please log in.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        console.log('User ID:', userId, 'Role:', userRole);

        // Determine API endpoint based on user role
        let apiEndpoint = '';
        if (userRole === 'CUSTOMER' || userRole === 'ADMIN') {
            // Customer và Admin dùng Customer endpoint
            apiEndpoint = `/api/Customer/user/${userId}`;
        } else {
            // Staff và Manager dùng User endpoint chung
            apiEndpoint = `/api/User/${userId}`;
        }

        console.log('Fetching from endpoint:', apiEndpoint);

        axiosInstance.get(apiEndpoint)
            .then(res => {
                console.log('API response:', res.data);
                if (res.data && res.data.result) {
                    setCustomerData(res.data.result);
                } else {
                    setError('Invalid response format from server');
                }
            })
            .catch(err => {
                console.error('Error fetching user data:', err);
                if (err.response?.status === 404) {
                    setError('User not found or not authorized to access this information.');
                } else {
                    setError('Failed to fetch user data. Please try again later.');
                }
            })
            .finally(() => setLoading(false));
    }, [userId, userRole]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center py-8">
                <Alert message={error} type="error" showIcon />
            </div>
        );
    }

    if (!customerData) {
        return (
            <div className="flex justify-center items-center py-8">
                <Alert message="Không tìm thấy thông tin khách hàng." type="info" showIcon />
            </div>
        );
    }

    return (
        <div className="flex justify-center items-start">
            <Card className={styles['customer-info-card']}>
                <div className={styles['customer-header']}>
                    <Avatar
                        size={64}
                        src={customerData.avatar}
                        icon={<UserOutlined />}
                    />
                    <Title level={3} style={{ margin: '12px 0' }}>
                        {customerData.fullName || 'Chưa cập nhật'}
                    </Title>
                    <Text style={{ 
                        color: getRoleColor(userRole),
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}>
                        {getRoleDisplayName(userRole)}
                    </Text>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <Row gutter={[16, 8]}>
                    <Col span={24}>
                        <div className={styles['info-item']}>
                            <MailOutlined /> <Text strong>Email:</Text> {customerData.email}
                        </div>
                    </Col>
                    <Col span={24}>
                        <div className={styles['info-item']}>
                            <PhoneOutlined /> <Text strong>Số điện thoại:</Text> {customerData.phoneNumber}
                        </div>
                    </Col>
                    <Col span={24}>
                        <div className={styles['info-item']}>
                            <EnvironmentOutlined /> <Text strong>Địa chỉ:</Text> {customerData.address}
                        </div>
                    </Col>
                    <Col span={24}>
                        <div className={styles['info-item']}>
                            <IdcardOutlined /> <Text strong>Số CMND/CCCD:</Text> {customerData.identityId}
                        </div>
                    </Col>
                    <Col span={24}>
                        <div className={styles['info-item']}>
                            <CalendarOutlined /> <Text strong>Ngày sinh:</Text> {customerData.dateOfBirth?.slice(0, 10)}
                        </div>
                    </Col>
                    <Col span={24}>
                        <div className={styles['info-item']}>
                            {customerData.sex === 'Male' ? <ManOutlined /> : <WomanOutlined />} <Text strong>Giới tính:</Text> {customerData.sex === 'Male' ? 'Nam' : customerData.sex === 'Female' ? 'Nữ' : customerData.sex}
                        </div>
                    </Col>
                    <Col span={24}>
                        <div className={styles['info-item']}>
                            <StarOutlined /> <Text strong>Loại khách hàng:</Text> {customerData.customerType === 0 ? 'Khách hàng thường' : customerData.customerType === 1 ? 'Học sinh/Sinh viên' : 'Khách hàng thường'}
                        </div>
                    </Col>
                </Row>

                <div style={{ textAlign: 'center' }}>
                    <UpdateProfileButton onUpdate={() => {
                        // Force re-fetch data after update
                        setLoading(true);
                        setError(null);
                        
                        // Use same logic as main fetch
                        let apiEndpoint = '';
                        if (userRole === 'CUSTOMER' || userRole === 'ADMIN') {
                            apiEndpoint = `/api/Customer/user/${userId}`;
                        } else {
                            apiEndpoint = `/api/User/${userId}`;
                        }
                        
                        axiosInstance.get(apiEndpoint)
                            .then(res => {
                                if (res.data && res.data.result) {
                                    setCustomerData(res.data.result);
                                }
                            })
                            .catch(err => {
                                console.error('Error refreshing data:', err);
                                setError('Failed to refresh data');
                            })
                            .finally(() => setLoading(false));
                    }} />
                </div>
            </Card>
        </div>
    );
};

export default CustomerInfo;
