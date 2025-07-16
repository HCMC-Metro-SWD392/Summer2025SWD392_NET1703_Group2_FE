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

const AccountInfo: React.FC = () => {
    const navigate = useNavigate();
    const user: UserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const customerId = user.id;
    const [customerData, setCustomerData] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const userInfo = getUserInfo();
    const role = userInfo?.role?.toUpperCase?.() || '';

    useEffect(() => {
        if (!customerId) {
            setError('No customer ID found. Please log in.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        // Log customerId để kiểm tra
        console.log('customerId:', customerId);

        axiosInstance.get(`/api/Customer/user/${customerId}`)
            .then(res => {
                console.log('API response:', res.data);
                if (res.data && res.data.result) {
                    setCustomerData(res.data.result);
                } else {
                    setError('Invalid response format from server');
                }
            })
            .catch(err => {
                console.error('Error fetching customer data:', err);
                setError('Failed to fetch customer data. Please try again later.');
            })
            .finally(() => setLoading(false));
    }, [customerId]);

    if (loading) {
        return (
            <div className="flex min-h-screen justify-center items-center">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen justify-center items-center">
                <Alert message={error} type="error" showIcon />
            </div>
        );
    }

    if (!customerData) {
        return (
            <div className="flex min-h-screen justify-center items-center">
                <Alert message="Không tìm thấy thông tin khách hàng." type="info" showIcon />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen justify-center items-start pt-16 pb-8">
            <div style={{ width: '100%', maxWidth: 800, display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: '#f0f0f0', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontWeight: 500 }}
                >
                    ← Quay lại
                </button>
            </div>
            <Card className={styles['customer-info-card']}>
                {role === 'CUSTOMER' && (
                    <div className={styles['customer-header']}>
                        <Avatar
                            size={64}
                            icon={<UserOutlined />}
                        />
                        <Title level={3} style={{ margin: '12px 0' }}>
                            {customerData.fullName}
                        </Title>
                    </div>
                )}

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
                            <StarOutlined /> <Text strong>Loại khách hàng:</Text> {customerData.customerType === 0 ? 'Thông thường' : 'Học sinh/Sinh viên'}
                        </div>
                    </Col>
                </Row>

                <div style={{ textAlign: 'center' }}>
                    <UpdateProfileButton onUpdate={() => {
                        // Force re-fetch data after update
                        setLoading(true);
                        setError(null);
                        axiosInstance.get(`/api/Customer/user/${customerId}`)
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

export default AccountInfo;
