import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Avatar, Divider, Spin, Alert, Button, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, IdcardOutlined, ManOutlined, WomanOutlined, CalendarOutlined, EditOutlined } from '@ant-design/icons';
import styles from './CustomerInfo.module.css';
import axiosInstance from '../../../../../settings/axiosInstance';
import type { UserInfo } from '../../../../../types/types';
import { getUserInfo } from '../../../../../api/auth/tokenUtils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const AccountInfo: React.FC = () => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [form] = Form.useForm();

    // Get current user info from token
    const currentUser = getUserInfo();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        if (!currentUser?.id) {
            setError('No user ID found. Please log in.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Use general user endpoint for all roles
            const apiEndpoint = `/api/User/${currentUser.id}`;
            console.log('Fetching user data from:', apiEndpoint);
            
            const response = await axiosInstance.get(apiEndpoint);
            console.log('API response:', response.data);
            
            if (response.data && response.data.result) {
                setUserInfo(response.data.result);
            } else {
                setError('Invalid response format from server');
            }
        } catch (err: any) {
            console.error('Error fetching user data:', err);
            if (err.response?.status === 404) {
                setError('User not found or not authorized to access this information.');
            } else {
                setError('Failed to fetch user data. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = () => {
        form.setFieldsValue({
            fullName: userInfo?.fullName,
            email: userInfo?.email,
            phoneNumber: userInfo?.phoneNumber,
            address: userInfo?.address,
            dateOfBirth: userInfo?.dateOfBirth ? dayjs(userInfo.dateOfBirth) : undefined,
            identityId: userInfo?.identityId,
            sex: userInfo?.sex,
        });
        setUpdateModalVisible(true);
    };

    const handleUpdateSubmit = async (values: any) => {
        if (!currentUser?.id) {
            Alert.error({ message: 'User ID not found' });
            return;
        }

        setUpdateLoading(true);
        try {
            const formattedDate = values.dateOfBirth 
                ? dayjs(values.dateOfBirth).format('YYYY-MM-DD')
                : userInfo?.dateOfBirth;

            const payload = {
                fullName: values.fullName || userInfo?.fullName,
                address: values.address || userInfo?.address,
                sex: values.sex || userInfo?.sex,
                dateOfBirth: formattedDate,
                email: values.email || userInfo?.email,
                phoneNumber: values.phoneNumber || userInfo?.phoneNumber,
                identityId: values.identityId || userInfo?.identityId,
            };

            // Use general user update endpoint
            const updateUrl = `/api/User/${currentUser.id}`;
            const response = await axiosInstance.put(updateUrl, payload);

            if (response.data.isSuccess) {
                Alert.success({ message: 'Cập nhật thông tin thành công!' });
                setUpdateModalVisible(false);
                fetchUserData(); // Refresh data
                
                // Update localStorage with new info
                const updatedUserInfo = { ...currentUser, ...payload };
                localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
            } else {
                Alert.error({ message: response.data.message || 'Cập nhật thất bại' });
            }
        } catch (err: any) {
            console.error('Error updating profile:', err);
            Alert.error({ message: 'Có lỗi xảy ra khi cập nhật thông tin' });
        } finally {
            setUpdateLoading(false);
        }
    };

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

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Spin size="large" tip="Đang tải thông tin..." />
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

    if (!userInfo) {
        return (
            <div className="flex justify-center items-center py-8">
                <Alert message="Không tìm thấy thông tin người dùng." type="info" showIcon />
            </div>
        );
    }

    return (
        <div className="flex justify-center items-start">
            <Card className={styles['customer-info-card']}>
                <div className={styles['customer-header']}>
                    <Avatar
                        size={64}
                        src={userInfo.avatarUrl}
                        icon={<UserOutlined />}
                    />
                    <Title level={3} style={{ margin: '12px 0' }}>
                        {userInfo.fullName || 'Chưa cập nhật'}
                    </Title>
                    <Text style={{ 
                        color: getRoleColor(currentUser?.role || ''),
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}>
                        {getRoleDisplayName(currentUser?.role || '')}
                    </Text>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <div className={styles['info-item']}>
                            <MailOutlined className={styles['info-icon']} />
                            <div>
                                <Text type="secondary">Email</Text>
                                <br />
                                <Text strong>{userInfo.email}</Text>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12}>
                        <div className={styles['info-item']}>
                            <PhoneOutlined className={styles['info-icon']} />
                            <div>
                                <Text type="secondary">Số điện thoại</Text>
                                <br />
                                <Text strong>{userInfo.phoneNumber || 'Chưa cập nhật'}</Text>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12}>
                        <div className={styles['info-item']}>
                            <EnvironmentOutlined className={styles['info-icon']} />
                            <div>
                                <Text type="secondary">Địa chỉ</Text>
                                <br />
                                <Text strong>{userInfo.address || 'Chưa cập nhật'}</Text>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12}>
                        <div className={styles['info-item']}>
                            <CalendarOutlined className={styles['info-icon']} />
                            <div>
                                <Text type="secondary">Ngày sinh</Text>
                                <br />
                                <Text strong>
                                    {userInfo.dateOfBirth 
                                        ? dayjs(userInfo.dateOfBirth).format('DD/MM/YYYY')
                                        : 'Chưa cập nhật'
                                    }
                                </Text>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12}>
                        <div className={styles['info-item']}>
                            <IdcardOutlined className={styles['info-icon']} />
                            <div>
                                <Text type="secondary">CMND/CCCD</Text>
                                <br />
                                <Text strong>{userInfo.identityId || 'Chưa cập nhật'}</Text>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12}>
                        <div className={styles['info-item']}>
                            {userInfo.sex === 'Male' ? <ManOutlined className={styles['info-icon']} /> : <WomanOutlined className={styles['info-icon']} />}
                            <div>
                                <Text type="secondary">Giới tính</Text>
                                <br />
                                <Text strong>
                                    {userInfo.sex === 'Male' ? 'Nam' : 
                                     userInfo.sex === 'Female' ? 'Nữ' : 'Chưa cập nhật'}
                                </Text>
                            </div>
                        </div>
                    </Col>
                </Row>

                <Divider style={{ margin: '16px 0' }} />

                <div style={{ textAlign: 'center' }}>
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />}
                        onClick={handleUpdateProfile}
                        size="large"
                    >
                        Cập nhật thông tin
                    </Button>
                </div>
            </Card>

            {/* Update Profile Modal */}
            <Modal
                title="Cập nhật thông tin cá nhân"
                open={updateModalVisible}
                onCancel={() => setUpdateModalVisible(false)}
                onOk={() => form.submit()}
                okText="Lưu"
                cancelText="Hủy"
                confirmLoading={updateLoading}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateSubmit}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item 
                                label="Họ và tên" 
                                name="fullName" 
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                            >
                                <Input placeholder="Nhập họ và tên" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item 
                                label="Email" 
                                name="email" 
                                rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}
                            >
                                <Input placeholder="Nhập email" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Số điện thoại" name="phoneNumber">
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Số CMND/CCCD" name="identityId">
                                <Input placeholder="Nhập số CMND/CCCD" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Địa chỉ" name="address">
                        <Input placeholder="Nhập địa chỉ" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Ngày sinh" name="dateOfBirth">
                                <DatePicker 
                                    style={{ width: '100%' }} 
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày sinh"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Giới tính" name="sex">
                                <Select placeholder="Chọn giới tính">
                                    <Option value="Male">Nam</Option>
                                    <Option value="Female">Nữ</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default AccountInfo; 