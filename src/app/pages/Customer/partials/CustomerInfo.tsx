import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Avatar, Divider, Spin, Alert } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, IdcardOutlined, ManOutlined, WomanOutlined, StarOutlined, CalendarOutlined } from '@ant-design/icons';
import styles from './CustomerInfo.module.css';
import UpdateProfileButton from './UpdateProfileButton';
import axiosInstance from '../../../../settings/axiosInstance';
import type { UserInfo } from '../../../../types/types';

const { Title, Text } = Typography;

const CustomerInfo: React.FC = () => {
    const user: UserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const customerId = user.id;
    const [customerData, setCustomerData] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!customerId) {
            setError('Không tìm thấy ID khách hàng. Vui lòng đăng nhập.');
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
                    setError('Định dạng phản hồi không hợp lệ từ máy chủ');
                }
            })
            .catch(err => {
                console.error('Error fetching customer data:', err);
                setError('Không thể tải dữ liệu khách hàng. Vui lòng thử lại sau.');
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
                <Alert message="Không tìm thấy dữ liệu khách hàng." type="info" showIcon />
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
                    />
                    <Title level={3} style={{ margin: '12px 0' }}>
                        {customerData.fullName}
                    </Title>
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
                            <IdcardOutlined /> <Text strong>CCCD/CMND:</Text> {customerData.identityId}
                        </div>
                    </Col>
                    <Col span={24}>
                        <div className={styles['info-item']}>
                            <CalendarOutlined /> <Text strong>Ngày sinh:</Text> {customerData.dateOfBirth?.slice(0, 10)}
                        </div>
                    </Col>
                    <Col span={24}>
                        <div className={styles['info-item']}>
                            {customerData.sex === 'Male' ? <ManOutlined /> : <WomanOutlined />} <Text strong>Giới tính:</Text> {customerData.sex === 'Male' ? 'Nam' : 'Nữ'}
                        </div>
                    </Col>
                    <Col span={24}>
                        <div className={styles['info-item']}>
                            <StarOutlined /> <Text strong>Loại khách hàng:</Text> {customerData.customerType === 0 ? 'Thường' : 'VIP'}
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
                                setError('Không thể làm mới dữ liệu');
                            })
                            .finally(() => setLoading(false));
                    }} />
                </div>
            </Card>
        </div>
    );
};

export default CustomerInfo;
