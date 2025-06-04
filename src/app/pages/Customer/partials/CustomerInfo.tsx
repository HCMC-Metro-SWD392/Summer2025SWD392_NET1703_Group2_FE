import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Avatar, Divider, Spin, Alert } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, IdcardOutlined, ManOutlined, WomanOutlined, StarOutlined } from '@ant-design/icons';
import styles from './CustomerInfo.module.css';
import UpdateProfileButton from './UpdateProfileButton';
import axiosInstance from '../../../../settings/axiosInstance';
import type { UserInfo } from '../../../../types/types';

const { Title, Text } = Typography;

const CustomerInfo: React.FC = () => {
    const user: UserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    // console.log(user);
    const customerId = user.id;
    // console.log(customerId);
    const [customerData, setCustomerData] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                setCustomerData(res.data.result);
            })
            .catch(err => setError(err.message))
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
                <Alert message="Error" description={error} type="error" showIcon />
            </div>
        );
    }
    if (!customerData) {
        return (
            <div className="flex min-h-screen justify-center items-center">
                <Alert message="No customer data found." type="info" showIcon />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen justify-center items-start pt-16 pb-8">
            <Card className={styles['customer-info-card']}>
                <div className={styles['customer-header']}>
                    <Avatar
                        size={64}
                        icon={<UserOutlined />}
                        // Nếu có avatar, bạn có thể truyền src={customerData.avatar}
                    />
                    <Title level={3} style={{ margin: '12px 0' }}>
                        {customerData.fullName}
                    </Title>
                    <Text type="secondary">Customer ID: {customerData.identityId}</Text>
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
                            <PhoneOutlined /> <Text strong>Phone:</Text> {customerData.phoneNumber}
                        </div>
                    </Col>
                    <Col span={24}>
                        <div className={styles['info-item']}>
                            <EnvironmentOutlined /> <Text strong>Address:</Text> {customerData.address}
                        </div>
                    </Col>
                    <Col span={24}>
                        <div className={styles['info-item']}>
                            <IdcardOutlined /> <Text strong>Identity ID:</Text> {customerData.identityId}
                        </div>
                    </Col>
                    <Col span={24}>
                        <div className={styles['info-item']}>
                            <Text strong>Date of Birth:</Text> {customerData.dateOfBirth?.slice(0, 10)}
                        </div>
                    </Col>
                    <Col span={24}>
                        <div className={styles['info-item']}>
                            {customerData.sex === 'Male' ? <ManOutlined /> : <WomanOutlined />} <Text strong>Sex:</Text> {customerData.sex}
                        </div>
                    </Col>
                    <Col span={24}>
                        <div className={styles['info-item']}>
                            <StarOutlined /> <Text strong>Customer Type:</Text> {customerData.customerType === 0 ? 'Normal' : 'VIP'}
                        </div>
                    </Col>
                </Row>

                {/* Nút cập nhật hồ sơ */}
                <div style={{ textAlign: 'center' }}>
                    <UpdateProfileButton />
                </div>
            </Card>
        </div>
    );
};

export default CustomerInfo;
